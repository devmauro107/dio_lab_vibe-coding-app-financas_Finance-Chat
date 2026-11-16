import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { CheckCircle2, Target, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { chatHistoryQuery, profileQuery } from "@/lib/data";
import { formatBRL, CATEGORY_META, type Category } from "@/lib/finance";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool";
import { Shimmer } from "@/components/ai-elements/shimmer";
import mascote from "@/assets/mascote.png";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({
    meta: [
      { title: "Conversa — Brotinho" },
      { name: "description", content: "Converse com o Brotinho para registrar gastos e acompanhar metas." },
      { property: "og:title", content: "Conversa — Brotinho" },
      { property: "og:description", content: "Registre gastos e metas conversando." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { data: history, isLoading } = useQuery(chatHistoryQuery);
  if (isLoading || !history) {
    return <div className="flex flex-1 items-center justify-center text-muted-foreground" role="status">Carregando conversa…</div>;
  }
  return <ChatWindow initial={history as unknown as UIMessage[]} />;
}

const SUGGESTIONS = [
  "Gastei R$ 45 no almoço hoje",
  "Paguei R$ 120 de internet",
  "Quero guardar R$ 3.000 para viajar em dezembro",
  "Quanto gastei com transporte este mês?",
];

const TOOL_TITLES: Record<string, string> = {
  registrar_gasto: "Registrar gasto",
  criar_meta: "Criar meta",
  adicionar_a_meta: "Guardar na meta",
  consultar_gastos: "Consultar gastos",
};

function ChatWindow({ initial }: { initial: UIMessage[] }) {
  const qc = useQueryClient();
  const { data: profile } = useQuery(profileQuery);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: async (): Promise<Record<string, string>> => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    [],
  );

  const { messages, sendMessage, status, stop } = useChat({
    id: "principal",
    messages: initial,
    transport,
    onError: (err) => {
      const m = err.message ?? "";
      if (m.includes("402")) toast.error("Os créditos de IA acabaram. Tente mais tarde.");
      else if (m.includes("429")) toast.error("Muitas mensagens seguidas. Espere um pouquinho.");
      else toast.error("Não consegui responder agora. Verifique sua internet e tente de novo.");
    },
    onFinish: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: chatHistoryQuery.queryKey, refetchType: "none" });
    },
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!busy) textareaRef.current?.focus();
  }, [busy]);

  function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    sendMessage({ text: t });
  }

  const first = profile?.name?.split(" ")[0];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-3 border-b-2 px-4 py-3">
        <img src={mascote} alt="" width={40} height={40} className="h-10 w-10" />
        <div>
          <h1 className="text-xl font-bold leading-none">Brotinho</h1>
          <p className="text-sm text-muted-foreground">Seu assistente financeiro</p>
        </div>
      </header>

      <Conversation className="min-h-0 flex-1" aria-live="polite">
        <ConversationContent className="gap-5 px-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center pt-6 text-center">
              <img src={mascote} alt="" width={120} height={120} className="h-28 w-28" />
              <h2 className="mt-3 text-2xl font-bold">Oi{first ? `, ${first}` : ""}! 👋</h2>
              <p className="mt-1 max-w-sm text-muted-foreground">
                Me conte um gasto do jeito que você falaria. Por exemplo: “gastei 30 no mercado”.
              </p>
            </div>
          )}
          {messages.map((m) => (
            <Message key={m.id} from={m.role}>
              <MessageContent className="text-base">
                {m.parts.map((part, i) => {
                  if (part.type === "text") return <MessageResponse key={i}>{part.text}</MessageResponse>;
                  if (part.type.startsWith("tool-")) {
                    const p = part as Extract<typeof part, { type: `tool-${string}` }> & {
                      state: "input-streaming" | "input-available" | "output-available" | "output-error";
                      input?: unknown;
                      output?: unknown;
                      errorText?: string;
                    };
                    const name = p.type.slice(5);
                    return (
                      <div key={i} className="space-y-2">
                        <ToolResultCard name={name} output={p.state === "output-available" ? p.output : undefined} />
                        <Tool defaultOpen={false}>
                          <ToolHeader type={p.type as never} state={p.state as never} title={TOOL_TITLES[name] ?? name} />
                          <ToolContent>
                            <ToolInput input={p.input} />
                            <ToolOutput output={p.output} errorText={p.errorText} />
                          </ToolContent>
                        </Tool>
                      </div>
                    );
                  }
                  return null;
                })}
              </MessageContent>
            </Message>
          ))}
          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer>Pensando…</Shimmer>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton aria-label="Ir para a última mensagem" />
      </Conversation>

      <div className="space-y-2 px-3 pb-3">
        {messages.length < 2 && (
          <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Sugestões rápidas">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                disabled={busy}
                className="shrink-0 rounded-full border-2 bg-card px-4 py-2 text-sm font-bold text-foreground hover:bg-accent disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <PromptInput onSubmit={(msg) => send(msg.text)} className="rounded-2xl border-2 bg-card">
          <PromptInputTextarea
            ref={textareaRef}
            autoFocus
            aria-label="Escreva sua mensagem"
            placeholder="Ex: gastei R$ 30 no mercado"
            className="text-base"
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} onStop={stop} aria-label={busy ? "Parar" : "Enviar mensagem"} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

type Out = { ok?: boolean; erro?: string; gasto?: { amount: number; category: string; description: string }; meta?: { name: string; current_amount: number; target_amount: number }; previsao?: { progress: number; perMonth: number | null }; total?: number; quantidade?: number };

function ToolResultCard({ name, output }: { name: string; output: unknown }) {
  const o = output as Out | undefined;
  if (!o) return null;
  if (!o.ok) return <p className="rounded-xl border-2 border-destructive p-3 text-sm font-semibold text-destructive">{o.erro ?? "Algo deu errado."}</p>;
  if (name === "registrar_gasto" && o.gasto) {
    const meta = CATEGORY_META[o.gasto.category as Category] ?? CATEGORY_META.Outros;
    return (
      <div className="flex items-center gap-3 rounded-2xl border-2 bg-secondary p-3 text-secondary-foreground">
        <span className="text-2xl" aria-hidden="true">{meta.emoji}</span>
        <div className="flex-1">
          <p className="font-extrabold">{formatBRL(Number(o.gasto.amount))}</p>
          <p className="text-sm">{o.gasto.description} · {o.gasto.category}</p>
        </div>
        <CheckCircle2 className="h-6 w-6 text-primary" aria-label="Salvo" />
      </div>
    );
  }
  if ((name === "criar_meta" || name === "adicionar_a_meta") && o.meta) {
    const pct = o.previsao?.progress ?? 0;
    return (
      <div className="rounded-2xl border-2 bg-secondary p-3 text-secondary-foreground">
        <p className="flex items-center gap-2 font-extrabold"><Target className="h-5 w-5" aria-hidden="true" /> {o.meta.name}</p>
        <div className="mt-2 h-3 rounded-full bg-background" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso da meta">
          <div className="h-3 rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-sm">{formatBRL(Number(o.meta.current_amount))} de {formatBRL(Number(o.meta.target_amount))} ({pct}%)</p>
      </div>
    );
  }
  if (name === "consultar_gastos" && o.total !== undefined) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border-2 bg-secondary p-3 text-secondary-foreground">
        <Search className="h-5 w-5" aria-hidden="true" />
        <p className="font-bold">{formatBRL(o.total)} em {o.quantidade} gasto(s)</p>
      </div>
    );
  }
  return null;
}
