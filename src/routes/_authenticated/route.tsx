import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { MessageCircle, PieChart, Target, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import mascote from "@/assets/mascote.png";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth", search: { mode: "login" } });
  },
  component: AppShell,
});

const nav = [
  { to: "/chat", label: "Conversa", icon: MessageCircle },
  { to: "/painel", label: "Resumo", icon: PieChart },
  { to: "/metas", label: "Metas", icon: Target },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

function AppShell() {
  const { data: profile } = useQuery(profileQuery);

  useEffect(() => {
    if (!profile) return;
    const root = document.documentElement;
    root.classList.toggle("dark", profile.theme === "dark");
    root.style.setProperty("--font-scale", String(profile.font_scale ?? 1));
  }, [profile]);

  if (!profile) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground" role="status">Carregando…</div>;
  }
  if (!profile.onboarded) return <Onboarding initialName={profile.name ?? ""} />;

  return (
    <div className="mx-auto flex h-dvh max-w-2xl flex-col">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-card focus:p-2">
        Pular para o conteúdo
      </a>
      <main id="conteudo" className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </main>
      <nav aria-label="Navegação principal" className="border-t-2 bg-card">
        <ul className="grid grid-cols-4">
          {nav.map((n) => (
            <li key={n.to}>
              <Link
                to={n.to}
                className="flex flex-col items-center gap-1 py-2.5 text-sm font-bold text-muted-foreground"
                activeProps={{ className: "text-primary", "aria-current": "page" }}
              >
                <n.icon className="h-6 w-6" aria-hidden="true" />
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

const GOALS = ["Sair das dívidas", "Criar reserva de emergência", "Fazer uma viagem", "Comprar algo especial", "Só entender meus gastos"];

function Onboarding({ initialName }: { initialName: string }) {
  const qc = useQueryClient();
  const [step, setStep] = useState(initialName ? 1 : 0);
  const [name, setName] = useState(initialName);
  const [goal, setGoal] = useState("");
  const [saving, setSaving] = useState(false);

  async function finish() {
    setSaving(true);
    const { data } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("profiles")
      .update({ name, main_goal: goal, onboarded: true })
      .eq("id", data.user!.id);
    setSaving(false);
    if (error) { toast.error("Não consegui salvar. Tente de novo."); return; }
    qc.invalidateQueries({ queryKey: ["profile"] });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
      <img src={mascote} alt="" width={112} height={112} className="mx-auto h-28 w-28" />
      <p className="mt-2 text-center text-sm font-bold text-muted-foreground">Passo {step + 1} de 2</p>
      {step === 0 ? (
        <form
          className="mt-4 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) setStep(1);
          }}
        >
          <h1 className="text-center text-3xl font-bold">Oi! Como posso te chamar?</h1>
          <Label htmlFor="ob-name" className="sr-only">Seu nome</Label>
          <Input id="ob-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="h-14 rounded-2xl text-lg" />
          <Button type="submit" variant="pop" size="xl" className="w-full" disabled={!name.trim()}>Continuar</Button>
        </form>
      ) : (
        <div className="mt-4 space-y-5">
          <h1 className="text-center text-3xl font-bold">Qual é seu principal objetivo, {name.split(" ")[0]}?</h1>
          <fieldset className="space-y-3">
            <legend className="sr-only">Objetivo financeiro principal</legend>
            {GOALS.map((g) => (
              <label key={g} className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 text-lg font-semibold has-[:checked]:border-primary has-[:checked]:bg-accent has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-ring`}>
                <input type="radio" name="goal" value={g} checked={goal === g} onChange={() => setGoal(g)} className="h-5 w-5 accent-[var(--color-primary)]" />
                {g}
              </label>
            ))}
          </fieldset>
          <Button variant="pop" size="xl" className="w-full" disabled={!goal || saving} onClick={finish}>
            {saving ? "Salvando…" : "Começar a conversar"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setStep(0)}>Voltar</Button>
        </div>
      )}
    </main>
  );
}
