import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import mascote from "@/assets/mascote.png";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ mode: z.enum(["login", "signup"]).catch("login") }),
  head: () => ({
    meta: [
      { title: "Entrar — Brotinho" },
      { name: "description", content: "Entre ou crie sua conta no Brotinho para organizar suas finanças." },
      { property: "og:title", content: "Entrar — Brotinho" },
      { property: "og:description", content: "Entre ou crie sua conta no Brotinho." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function translate(msg: string) {
  if (/invalid login/i.test(msg)) return "E-mail ou senha incorretos.";
  if (/email not confirmed/i.test(msg)) return "Confirme seu e-mail antes de entrar. Veja sua caixa de entrada.";
  if (/already registered/i.test(msg)) return "Esse e-mail já tem conta. Tente entrar.";
  if (/password/i.test(msg)) return "A senha precisa ter pelo menos 6 caracteres.";
  return "Algo deu errado. Tente novamente.";
}

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const isSignup = mode === "signup";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/chat", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/chat", data: { name } },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/chat" });
        else setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/chat" });
      }
    } catch (err) {
      toast.error(translate((err as Error).message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
      <Link to="/" className="mx-auto">
        <img src={mascote} alt="Brotinho, voltar ao início" width={96} height={96} className="h-24 w-24" />
      </Link>
      {sent ? (
        <div className="mt-6 rounded-3xl border-2 bg-card p-6 text-center shadow-card" role="status">
          <h1 className="text-2xl font-bold">Confira seu e-mail 📬</h1>
          <p className="mt-2 text-muted-foreground">
            Enviamos um link para <strong className="text-foreground">{email}</strong>. Clique nele para ativar sua conta.
          </p>
        </div>
      ) : (
        <>
          <h1 className="mt-4 text-center text-3xl font-bold">{isSignup ? "Criar sua conta" : "Bem-vindo de volta"}</h1>
          <form onSubmit={submit} className="mt-8 space-y-5">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">Como podemos te chamar?</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="given-name" className="h-12 rounded-xl text-base" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="h-12 rounded-xl text-base" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base">Senha</Label>
              <Input id="password" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete={isSignup ? "new-password" : "current-password"} aria-describedby="pw-hint" className="h-12 rounded-xl text-base" />
              <p id="pw-hint" className="text-sm text-muted-foreground">Pelo menos 6 caracteres.</p>
            </div>
            <Button type="submit" variant="pop" size="xl" className="w-full" disabled={loading}>
              {loading ? "Aguarde..." : isSignup ? "Criar conta" : "Entrar"}
            </Button>
          </form>
          <p className="mt-6 text-center text-muted-foreground">
            {isSignup ? "Já tem conta? " : "Ainda não tem conta? "}
            <Link to="/auth" search={{ mode: isSignup ? "login" : "signup" }} className="font-bold text-primary underline-offset-4 hover:underline">
              {isSignup ? "Entrar" : "Criar conta"}
            </Link>
          </p>
        </>
      )}
    </main>
  );
}
