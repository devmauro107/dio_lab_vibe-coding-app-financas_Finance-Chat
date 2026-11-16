import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { AlertTriangle, TrendingDown, Trash2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { goalsQuery, transactionsQuery } from "@/lib/data";
import {
  CATEGORY_META, categoryAlerts, formatBRL, formatDateBR, goalForecast, monthKey, monthlyEvolution,
  prevMonthKey, sum, todayISO, totalsByCategory, type Category,
} from "@/lib/finance";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Resumo do mês — Brotinho" },
      { name: "description", content: "Veja quanto gastou no mês, por categoria, e seus maiores gastos." },
      { property: "og:title", content: "Resumo do mês — Brotinho" },
      { property: "og:description", content: "Seu resumo financeiro simples." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Painel,
});

function Painel() {
  const qc = useQueryClient();
  const { data: txs = [], isLoading } = useQuery(transactionsQuery);
  const { data: goals = [] } = useQuery(goalsQuery);
  const today = todayISO();
  const cur = monthKey(today);
  const monthTxs = txs.filter((t) => monthKey(t.occurred_on) === cur);
  const total = sum(monthTxs);
  const lastTotal = sum(txs.filter((t) => monthKey(t.occurred_on) === prevMonthKey(cur)));
  const cats = totalsByCategory(monthTxs);
  const evo = monthlyEvolution(txs, cur, 6);
  const alerts = categoryAlerts(txs, cur);
  const top = [...monthTxs].sort((a, b) => b.amount - a.amount).slice(0, 5);
  const monthName = new Date().toLocaleDateString("pt-BR", { month: "long" });

  async function remove(id: string) {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) { toast.error("Não consegui apagar."); return; }
    toast.success("Gasto apagado.");
    qc.invalidateQueries({ queryKey: ["transactions"] });
  }

  if (isLoading) return <p className="p-6 text-muted-foreground" role="status">Carregando…</p>;

  return (
    <div className="flex-1 space-y-5 overflow-y-auto p-4">
      <h1 className="text-2xl font-bold">Resumo de {monthName}</h1>

      <section className="rounded-3xl bg-hero p-5 text-primary-foreground" aria-labelledby="total-h">
        <h2 id="total-h" className="text-base font-bold opacity-90">Total gasto no mês</h2>
        <p className="mt-1 text-4xl font-bold">{formatBRL(total)}</p>
        {lastTotal > 0 && (
          <p className="mt-1 font-semibold opacity-90">
            {total <= lastTotal ? "Menos" : "Mais"} que no mês passado ({formatBRL(lastTotal)})
          </p>
        )}
      </section>

      {txs.length === 0 && (
        <div className="rounded-3xl border-2 bg-card p-5 text-center">
          <p className="text-lg font-semibold">Nenhum gasto ainda.</p>
          <p className="text-muted-foreground">Conte seu primeiro gasto na conversa.</p>
          <Button asChild variant="pop" className="mt-4 h-12 px-6">
            <Link to="/chat"><MessageCircle aria-hidden="true" /> Ir para a conversa</Link>
          </Button>
        </div>
      )}

      {(alerts.length > 0 || goals.length > 0) && (
        <section aria-labelledby="alertas-h" className="space-y-2">
          <h2 id="alertas-h" className="text-lg font-bold">Avisos</h2>
          {alerts.map((a) => (
            <p key={a.category} className="flex items-start gap-2 rounded-2xl border-2 bg-card p-3">
              {a.changePct > 0 ? <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-sun" aria-hidden="true" /> : <TrendingDown className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />}
              <span>
                {a.changePct > 0
                  ? `Você gastou ${a.changePct}% a mais em ${a.category} que no mês passado.`
                  : `Boa! Você gastou ${Math.abs(a.changePct)}% a menos em ${a.category}.`}
              </span>
            </p>
          ))}
          {goals.slice(0, 2).map((g) => {
            const f = goalForecast(g, today);
            return f.perMonth ? (
              <p key={g.id} className="rounded-2xl border-2 bg-card p-3">
                🎯 Para “{g.name}”, guarde cerca de <strong>{formatBRL(f.perMonth)}</strong> por mês.
              </p>
            ) : null;
          })}
        </section>
      )}

      {cats.length > 0 && (
        <section aria-labelledby="cat-h" className="rounded-3xl border-2 bg-card p-4">
          <h2 id="cat-h" className="text-lg font-bold">Por categoria</h2>
          <ul className="mt-3 space-y-3">
            {cats.map((c) => {
              const meta = CATEGORY_META[c.category as Category] ?? CATEGORY_META.Outros;
              const pct = total ? Math.round((c.total / total) * 100) : 0;
              return (
                <li key={c.category}>
                  <div className="flex justify-between font-semibold">
                    <span><span aria-hidden="true">{meta.emoji}</span> {c.category}</span>
                    <span>{formatBRL(c.total)} <span className="text-muted-foreground">({pct}%)</span></span>
                  </div>
                  <div className="mt-1 h-3 rounded-full bg-muted" aria-hidden="true">
                    <div className="h-3 rounded-full" style={{ width: `${pct}%`, background: meta.color }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {txs.length > 0 && (
        <section aria-labelledby="evo-h" className="rounded-3xl border-2 bg-card p-4">
          <h2 id="evo-h" className="text-lg font-bold">Últimos 6 meses</h2>
          <div className="mt-3 h-48" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evo}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 13 }} />
                <YAxis hide />
                <Tooltip formatter={(v: number) => formatBRL(v)} cursor={{ fill: "var(--color-muted)" }} contentStyle={{ background: "var(--color-card)", border: "2px solid var(--color-border)", borderRadius: 12 }} />
                <Bar dataKey="total" radius={[8, 8, 8, 8]}>
                  {evo.map((e) => <Cell key={e.key} fill={e.key === cur ? "var(--color-primary)" : "var(--color-secondary-foreground)"} fillOpacity={e.key === cur ? 1 : 0.35} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className="sr-only">
            <caption>Gastos por mês</caption>
            <tbody>{evo.map((e) => <tr key={e.key}><th>{e.label}</th><td>{formatBRL(e.total)}</td></tr>)}</tbody>
          </table>
        </section>
      )}

      {top.length > 0 && (
        <section aria-labelledby="top-h" className="rounded-3xl border-2 bg-card p-4">
          <h2 id="top-h" className="text-lg font-bold">Maiores gastos do mês</h2>
          <ul className="mt-2 divide-y-2">
            {top.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-3">
                <span className="text-2xl" aria-hidden="true">{(CATEGORY_META[t.category as Category] ?? CATEGORY_META.Outros).emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{t.description || t.category}</p>
                  <p className="text-sm text-muted-foreground">{t.category} · {formatDateBR(t.occurred_on)}</p>
                </div>
                <span className="font-extrabold">{formatBRL(Number(t.amount))}</span>
                <Button variant="ghost" size="icon" aria-label={`Apagar gasto ${t.description}`} onClick={() => remove(t.id)}>
                  <Trash2 aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
