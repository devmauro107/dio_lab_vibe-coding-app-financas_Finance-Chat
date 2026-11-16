import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from "ai";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import {
  CATEGORIES,
  monthKey,
  prevMonthKey,
  sum,
  todayISO,
  totalsByCategory,
  formatBRL,
  goalForecast,
  type Tx,
} from "@/lib/finance";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server";

const MODEL = "openai/gpt-6-astra";
const GATEWAY = "https://ai.gateway.lovable.dev/v1";

function json(status: number, error: string) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function userClient(token: string) {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set("apikey", key);
        headers.set("Authorization", `Bearer ${token}`);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export async function handleChat(request: Request) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return json(500, "Assistente não configurado.");

  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return json(401, "Faça login para conversar.");
  const supabase = userClient(token);
  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData.user) return json(401, "Sua sessão expirou. Entre novamente.");
  const userId = userData.user.id;

  const body = (await request.json()) as { messages?: UIMessage[] };
  const messages = Array.isArray(body.messages) ? body.messages.slice(-40) : [];
  if (messages.length === 0) return json(400, "Mensagem vazia.");

  const today = todayISO();
  const curKey = monthKey(today);
  const sinceKey = prevMonthKey(curKey);

  const [{ data: profile }, { data: txRows }, { data: goals }] = await Promise.all([
    supabase.from("profiles").select("name, main_goal").eq("id", userId).maybeSingle(),
    supabase
      .from("transactions")
      .select("id, amount, category, description, occurred_on")
      .gte("occurred_on", `${sinceKey}-01`)
      .order("occurred_on", { ascending: false }),
    supabase.from("goals").select("*").order("created_at"),
  ]);
  const txs = (txRows ?? []) as Tx[];
  const cur = txs.filter((t) => monthKey(t.occurred_on) === curKey);
  const prev = txs.filter((t) => monthKey(t.occurred_on) === sinceKey);

  const context = [
    `Hoje é ${today}.`,
    `Usuário: ${profile?.name ?? "sem nome"}. Objetivo principal: ${profile?.main_goal ?? "não informado"}.`,
    `Gastos deste mês: ${formatBRL(sum(cur))}. Por categoria: ${totalsByCategory(cur).map((c) => `${c.category} ${formatBRL(c.total)}`).join(", ") || "nenhum"}.`,
    `Mês passado: ${formatBRL(sum(prev))}. Por categoria: ${totalsByCategory(prev).map((c) => `${c.category} ${formatBRL(c.total)}`).join(", ") || "nenhum"}.`,
    `Metas: ${(goals ?? []).map((g) => { const f = goalForecast(g, today); return `"${g.name}" ${formatBRL(g.current_amount)} de ${formatBRL(g.target_amount)}${g.deadline ? ` até ${g.deadline} (precisa ${formatBRL(f.perMonth ?? 0)}/mês)` : ""}`; }).join("; ") || "nenhuma"}.`,
  ].join("\n");

  const instructions = `Você é o Brotinho, um assistente de finanças pessoais em português do Brasil.
Tom: educativo, motivador, não julgador e objetivo. Use frases curtas e linguagem simples, sem jargões. Responda em no máximo 3 frases curtas, a menos que peçam detalhes.
Quando o usuário contar um gasto ("gastei", "paguei", "comprei"...), chame registrar_gasto imediatamente, escolhendo a categoria mais provável entre: ${CATEGORIES.join(", ")}. Datas relativas ("ontem") devem virar AAAA-MM-DD. Não peça confirmação; depois confirme o registro com valor e categoria e, se fizer sentido, dê uma dica curta.
Quando quiser criar uma meta ("quero guardar", "juntar"), chame criar_meta. Quando disser que guardou dinheiro para uma meta, chame adicionar_a_meta.
Para perguntas sobre gastos de um período, use consultar_gastos.
Se faltar o valor, pergunte de forma gentil. Valores em reais.

Contexto atual:
${context}`;

  const tools = {
    registrar_gasto: tool({
      description: "Registra uma despesa do usuário.",
      inputSchema: z.object({
        valor: z.number().describe("Valor em reais, positivo"),
        categoria: z.enum(CATEGORIES),
        descricao: z.string().describe("Descrição curta, ex: 'Almoço'"),
        data: z.string().nullable().describe("AAAA-MM-DD; null para hoje"),
      }),
      execute: async ({ valor, categoria, descricao, data }) => {
        const { data: row, error } = await supabase
          .from("transactions")
          .insert({ user_id: userId, amount: valor, category: categoria, description: descricao, occurred_on: data ?? today })
          .select("id, amount, category, description, occurred_on")
          .single();
        if (error) return { ok: false, erro: "Não consegui salvar o gasto." };
        return { ok: true, gasto: row };
      },
    }),
    criar_meta: tool({
      description: "Cria uma meta financeira.",
      inputSchema: z.object({
        nome: z.string(),
        valor_alvo: z.number(),
        prazo: z.string().nullable().describe("AAAA-MM-DD ou null"),
        valor_atual: z.number().nullable(),
      }),
      execute: async ({ nome, valor_alvo, prazo, valor_atual }) => {
        const { data: row, error } = await supabase
          .from("goals")
          .insert({ user_id: userId, name: nome, target_amount: valor_alvo, deadline: prazo, current_amount: valor_atual ?? 0 })
          .select("*")
          .single();
        if (error) return { ok: false, erro: "Não consegui criar a meta." };
        return { ok: true, meta: row, previsao: goalForecast(row, today) };
      },
    }),
    adicionar_a_meta: tool({
      description: "Adiciona um valor guardado a uma meta existente (pelo nome aproximado).",
      inputSchema: z.object({ nome_meta: z.string(), valor: z.number() }),
      execute: async ({ nome_meta, valor }) => {
        const list = goals ?? [];
        const g =
          list.find((x) => x.name.toLowerCase() === nome_meta.toLowerCase()) ??
          list.find((x) => x.name.toLowerCase().includes(nome_meta.toLowerCase()) || nome_meta.toLowerCase().includes(x.name.toLowerCase())) ??
          (list.length === 1 ? list[0] : undefined);
        if (!g) return { ok: false, erro: "Meta não encontrada.", metas: list.map((x) => x.name) };
        const { data: row, error } = await supabase
          .from("goals")
          .update({ current_amount: Number(g.current_amount) + valor })
          .eq("id", g.id)
          .select("*")
          .single();
        if (error) return { ok: false, erro: "Não consegui atualizar a meta." };
        return { ok: true, meta: row, previsao: goalForecast(row, today) };
      },
    }),
    consultar_gastos: tool({
      description: "Consulta gastos em um período, opcionalmente por categoria.",
      inputSchema: z.object({
        inicio: z.string().describe("AAAA-MM-DD"),
        fim: z.string().describe("AAAA-MM-DD"),
        categoria: z.enum(CATEGORIES).nullable(),
      }),
      execute: async ({ inicio, fim, categoria }) => {
        let q = supabase
          .from("transactions")
          .select("amount, category, description, occurred_on")
          .gte("occurred_on", inicio)
          .lte("occurred_on", fim)
          .order("amount", { ascending: false });
        if (categoria) q = q.eq("category", categoria);
        const { data, error } = await q;
        if (error) return { ok: false, erro: "Não consegui consultar." };
        const rows = (data ?? []) as Tx[];
        return { ok: true, total: sum(rows), quantidade: rows.length, por_categoria: totalsByCategory(rows), maiores: rows.slice(0, 5) };
      },
    }),
  };

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses(MODEL),
    instructions,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(8),
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  const lastUser = messages[messages.length - 1];
  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({
      originalMessages: messages,
      sendReasoning: false,
      onError: (e) => {
        console.error("chat error", e);
        return "Tive um problema para responder agora. Tente novamente em instantes.";
      },
      onFinish: async ({ responseMessage }) => {
        const rows = [lastUser, responseMessage]
          .filter((m): m is UIMessage => !!m && m.parts.length > 0)
          .map((m) => ({ user_id: userId, message_id: m.id, role: m.role, message: m as unknown as never }));
        const { error } = await supabase.from("chat_messages").upsert(rows, { onConflict: "user_id,message_id" });
        if (error) console.error("Falha ao salvar conversa", error);
      },
    }),
    runIdFetch,
  );
}
