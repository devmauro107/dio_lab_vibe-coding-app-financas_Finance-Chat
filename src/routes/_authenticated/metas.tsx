import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, PiggyBank, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { goalsQuery } from "@/lib/data";
import { formatBRL, goalForecast, todayISO, type Goal } from "@/lib/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/metas")({
  head: () => ({
    meta: [
      { title: "Minhas metas — Brotinho" },
      { name: "description", content: "Crie e acompanhe suas metas financeiras com previsão de conclusão." },
      { property: "og:title", content: "Minhas metas — Brotinho" },
      { property: "og:description", content: "Acompanhe suas metas financeiras." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Metas,
});

function Metas() {
  const { data: goals = [], isLoading } = useQuery(goalsQuery);
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Minhas metas</h1>
        {!creating && (
          <Button variant="pop" className="h-11 px-4" onClick={() => setCreating(true)}>
            <Plus aria-hidden="true" /> Nova meta
          </Button>
        )}
      </div>
      {creating && <NewGoal onDone={() => setCreating(false)} />}
      {isLoading && <p className="text-muted-foreground" role="status">Carregando…</p>}
      {!isLoading && goals.length === 0 && !creating && (
        <div className="rounded-3xl border-2 bg-card p-6 text-center">
          <PiggyBank className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />
          <p className="mt-2 text-lg font-semibold">Você ainda não tem metas.</p>
          <p className="text-muted-foreground">Crie aqui ou diga na conversa: “quero guardar R$ 3.000 para viajar”.</p>
        </div>
      )}
      <ul className="space-y-4">
        {goals.map((g) => <GoalCard key={g.id} goal={g} />)}
      </ul>
    </div>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const qc = useQueryClient();
  const [amount, setAmount] = useState("");
  const f = goalForecast(goal, todayISO());
  const done = f.progress >= 100;

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const v = Number(amount.replace(",", "."));
    if (!v || v <= 0) { toast.error("Digite um valor maior que zero."); return; }
    const { error } = await supabase.from("goals").update({ current_amount: Number(goal.current_amount) + v }).eq("id", goal.id);
    if (error) { toast.error("Não consegui salvar."); return; }
    setAmount("");
    toast.success(`Mais ${formatBRL(v)} em “${goal.name}”! 🎉`);
    qc.invalidateQueries({ queryKey: ["goals"] });
  }
  async function remove() {
    if (!confirm(`Apagar a meta “${goal.name}”?`)) return;
    const { error } = await supabase.from("goals").delete().eq("id", goal.id);
    if (error) { toast.error("Não consegui apagar."); return; }
    qc.invalidateQueries({ queryKey: ["goals"] });
  }

  return (
    <li className="rounded-3xl border-2 bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-xl font-bold">{goal.name}</h2>
        <Button variant="ghost" size="icon" aria-label={`Apagar meta ${goal.name}`} onClick={remove}><Trash2 aria-hidden="true" /></Button>
      </div>
      <p className="font-semibold">
        {formatBRL(Number(goal.current_amount))} <span className="text-muted-foreground">de {formatBRL(Number(goal.target_amount))}</span>
      </p>
      <div className="mt-2 h-4 rounded-full bg-muted" role="progressbar" aria-label={`Progresso de ${goal.name}`} aria-valuenow={f.progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-4 rounded-full bg-primary transition-all" style={{ width: `${f.progress}%` }} />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {done
          ? "Meta concluída! Parabéns! 🎉"
          : f.perMonth
            ? `Faltam ${formatBRL(f.remaining)}. Guardando ${formatBRL(f.perMonth)} por mês, você chega lá em ${f.monthsLeft} ${f.monthsLeft === 1 ? "mês" : "meses"}.`
            : `Faltam ${formatBRL(f.remaining)}. Sem prazo definido.`}
      </p>
      {!done && (
        <form onSubmit={add} className="mt-3 flex gap-2">
          <Label htmlFor={`add-${goal.id}`} className="sr-only">Valor para guardar</Label>
          <Input id={`add-${goal.id}`} inputMode="decimal" placeholder="R$ 0,00" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-11 rounded-xl text-base" />
          <Button type="submit" variant="soft" className="h-11">Guardar</Button>
        </form>
      )}
    </li>
  );
}

function NewGoal({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = Number(target.replace(/\./g, "").replace(",", "."));
    if (!name.trim() || !v) { toast.error("Preencha o nome e o valor."); return; }
    const { data } = await supabase.auth.getUser();
    const { error } = await supabase.from("goals").insert({ user_id: data.user!.id, name, target_amount: v, deadline: deadline || null });
    if (error) { toast.error("Não consegui criar a meta."); return; }
    toast.success("Meta criada!");
    qc.invalidateQueries({ queryKey: ["goals"] });
    onDone();
  }
  return (
    <form onSubmit={submit} className="space-y-4 rounded-3xl border-2 border-primary bg-card p-4">
      <h2 className="text-lg font-bold">Nova meta</h2>
      <div className="space-y-1">
        <Label htmlFor="g-name" className="text-base">O que você quer conquistar?</Label>
        <Input id="g-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Viagem de dezembro" className="h-12 rounded-xl text-base" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="g-target" className="text-base">Quanto precisa (R$)?</Label>
        <Input id="g-target" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="3000" className="h-12 rounded-xl text-base" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="g-deadline" className="text-base">Até quando? (opcional)</Label>
        <Input id="g-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="h-12 rounded-xl text-base" />
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="pop" className="h-12 flex-1">Criar meta</Button>
        <Button type="button" variant="ghost" className="h-12" onClick={onDone}>Cancelar</Button>
      </div>
    </form>
  );
}
