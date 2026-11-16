import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LogOut, Moon, Sun, Type, Bell } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil e preferências — Brotinho" },
      { name: "description", content: "Ajuste seu nome, tamanho da letra, tema e notificações." },
      { property: "og:title", content: "Perfil e preferências — Brotinho" },
      { property: "og:description", content: "Ajuste suas preferências." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Perfil,
});

const SIZES = [
  { v: 1, label: "Normal" },
  { v: 1.15, label: "Grande" },
  { v: 1.3, label: "Muito grande" },
];

function Perfil() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: p } = useQuery(profileQuery);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (p) { setName(p.name ?? ""); setGoal(p.main_goal ?? ""); }
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, [p]);

  if (!p) return null;

  async function update(patch: { name?: string; main_goal?: string; font_scale?: number; theme?: string; notifications?: boolean }, msg?: string) {
    qc.setQueryData(profileQuery.queryKey, { ...p!, ...patch });
    const { error } = await supabase.from("profiles").update(patch).eq("id", p!.id);
    if (error) { toast.error("Não consegui salvar."); qc.invalidateQueries({ queryKey: ["profile"] }); }
    else if (msg) toast.success(msg);
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.style.removeProperty("--font-scale");
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { mode: "login" }, replace: true });
  }

  return (
    <div className="flex-1 space-y-5 overflow-y-auto p-4">
      <h1 className="text-2xl font-bold">Perfil</h1>

      <form
        className="space-y-4 rounded-3xl border-2 bg-card p-4"
        onSubmit={(e) => { e.preventDefault(); update({ name, main_goal: goal }, "Dados salvos!"); }}
      >
        <h2 className="text-lg font-bold">Seus dados</h2>
        <p className="text-sm text-muted-foreground">E-mail: {email}</p>
        <div className="space-y-1">
          <Label htmlFor="p-name" className="text-base">Nome</Label>
          <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl text-base" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="p-goal" className="text-base">Objetivo principal</Label>
          <Input id="p-goal" value={goal} onChange={(e) => setGoal(e.target.value)} className="h-12 rounded-xl text-base" />
        </div>
        <Button type="submit" variant="pop" className="h-12 w-full">Salvar</Button>
      </form>

      <section className="space-y-4 rounded-3xl border-2 bg-card p-4" aria-labelledby="ac-h">
        <h2 id="ac-h" className="text-lg font-bold">Acessibilidade e aparência</h2>
        <fieldset>
          <legend className="flex items-center gap-2 font-semibold"><Type className="h-5 w-5" aria-hidden="true" /> Tamanho da letra</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {SIZES.map((s) => (
              <Button
                key={s.v}
                type="button"
                variant={Number(p.font_scale) === s.v ? "pop" : "soft"}
                className="h-12"
                aria-pressed={Number(p.font_scale) === s.v}
                onClick={() => update({ font_scale: s.v })}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="font-semibold">Tema</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button type="button" variant={p.theme !== "dark" ? "pop" : "soft"} className="h-12" aria-pressed={p.theme !== "dark"} onClick={() => update({ theme: "light" })}>
              <Sun aria-hidden="true" /> Claro
            </Button>
            <Button type="button" variant={p.theme === "dark" ? "pop" : "soft"} className="h-12" aria-pressed={p.theme === "dark"} onClick={() => update({ theme: "dark" })}>
              <Moon aria-hidden="true" /> Escuro
            </Button>
          </div>
        </fieldset>
      </section>

      <section className="rounded-3xl border-2 bg-card p-4" aria-labelledby="nt-h">
        <h2 id="nt-h" className="text-lg font-bold">Notificações</h2>
        <div className="mt-3 flex items-center justify-between gap-4">
          <Label htmlFor="notif" className="flex items-center gap-2 text-base"><Bell className="h-5 w-5" aria-hidden="true" /> Lembretes e dicas</Label>
          <Switch id="notif" checked={p.notifications} onCheckedChange={(v) => update({ notifications: v }, v ? "Lembretes ativados" : "Lembretes desativados")} />
        </div>
      </section>

      <Button variant="soft" className="h-12 w-full" onClick={signOut}>
        <LogOut aria-hidden="true" /> Sair da conta
      </Button>
    </div>
  );
}
