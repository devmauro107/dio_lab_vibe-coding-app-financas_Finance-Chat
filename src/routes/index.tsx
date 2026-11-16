import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Target, PieChart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import mascote from "@/assets/mascote.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Brotinho — organize suas finanças conversando" },
      { name: "description", content: "Diga 'gastei R$ 45 no almoço' e pronto. Gastos, metas e dicas num chat simples." },
      { property: "og:title", content: "Brotinho — organize suas finanças conversando" },
      { property: "og:description", content: "Diga 'gastei R$ 45 no almoço' e pronto. Gastos, metas e dicas num chat simples." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const benefits = [
  { icon: MessageCircle, title: "Fale como no WhatsApp", text: "Escreva “paguei R$ 120 de internet” e a gente anota." },
  { icon: PieChart, title: "Veja para onde vai o dinheiro", text: "Resumo do mês por categoria, sem planilha." },
  { icon: Target, title: "Realize seus planos", text: "Crie metas e saiba quanto guardar por mês." },
];

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <section className="bg-hero text-primary-foreground">
        <div className="mx-auto flex max-w-xl flex-col items-center px-6 pb-14 pt-12 text-center">
          <img src={mascote} alt="" width={160} height={160} className="h-40 w-40 drop-shadow-xl" />
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            Organizar o dinheiro pode ser só uma conversa.
          </h1>
          <p className="mt-4 text-lg opacity-90">
            Eu sou o Brotinho. Conte seus gastos do jeito que você fala — eu organizo, mostro o resumo e ajudo você a guardar.
          </p>
        </div>
      </section>

      <section className="mx-auto -mt-8 max-w-xl px-6">
        <div className="rounded-3xl border-2 bg-card p-5 shadow-card">
          <p className="text-sm font-bold text-muted-foreground">Exemplo</p>
          <p className="mt-2 inline-block rounded-2xl rounded-br-sm bg-primary px-4 py-2 font-semibold text-primary-foreground">
            Gastei R$ 45 no almoço hoje
          </p>
          <p className="mt-3 text-foreground">
            ✅ Anotado: <strong>R$ 45,00</strong> em <strong>Alimentação</strong>. Bom apetite!
          </p>
        </div>

        <ul className="mt-8 space-y-4" aria-label="Benefícios">
          {benefits.map((b) => (
            <li key={b.title} className="flex gap-4 rounded-2xl p-2">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
                <b.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">{b.title}</h2>
                <p className="text-muted-foreground">{b.text}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="space-y-3 py-10">
          <Button asChild variant="pop" size="xl" className="w-full">
            <Link to="/auth" search={{ mode: "signup" }}>
              Começar agora, é grátis <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="soft" size="xl" className="w-full">
            <Link to="/auth" search={{ mode: "login" }}>Já tenho conta</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
