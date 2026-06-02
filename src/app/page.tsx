import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BarChart3,
  Camera,
  Check,
  Clock,
  Leaf,
  Link2,
  MapPin,
  Share2,
  ShieldCheck,
  Sprout,
  Users,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { LandingNav } from "~/components/landing/landing-nav";

export const metadata: Metadata = {
  title: "AgroAnalise — Relatórios agronômicos que impressionam",
  description:
    "Documente visitas técnicas com fotos e análises, e compartilhe relatórios profissionais com seus clientes em um link. Gestão de fazendas e análises agronômicas.",
};

const features = [
  {
    icon: Camera,
    title: "Análises com fotos",
    desc: "Registre cada ponto da visita com fotos e a descrição técnica do agrônomo. As imagens são o centro do relatório.",
  },
  {
    icon: Share2,
    title: "Relatórios compartilháveis",
    desc: "Cada análise gera um link público com design profissional. Envie para o produtor por WhatsApp, e-mail ou QR Code.",
  },
  {
    icon: Users,
    title: "Gestão de fazendas",
    desc: "Centralize seus clientes, propriedades e o histórico de visitas em um só lugar, sempre acessível.",
  },
  {
    icon: MapPin,
    title: "Contexto da propriedade",
    desc: "Localização, documentos e dados de contato organizados junto a cada análise técnica.",
  },
  {
    icon: ShieldCheck,
    title: "Profissional e confiável",
    desc: "Relatórios padronizados com a sua identidade, que transmitem credibilidade ao seu trabalho.",
  },
  {
    icon: BarChart3,
    title: "Visão do seu trabalho",
    desc: "Acompanhe análises e fazendas pelo painel e tenha clareza sobre a sua operação.",
  },
];

const steps = [
  {
    n: "01",
    title: "Cadastre a fazenda",
    desc: "Registre o produtor e a propriedade com dados de contato e localização.",
  },
  {
    n: "02",
    title: "Documente a visita",
    desc: "Adicione fotos e a análise técnica de cada ponto observado em campo.",
  },
  {
    n: "03",
    title: "Compartilhe o link",
    desc: "Gere o relatório público e envie ao seu cliente em segundos.",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen">
      <LandingNav />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="from-chart-1/40 via-primary/10 dark:from-chart-1/10 dark:via-primary/5 absolute top-0 left-1/2 h-[40rem] w-[80rem] -translate-x-1/2 rounded-full bg-gradient-to-br to-transparent blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="border-primary/20 bg-primary/5 text-primary dark:border-primary/40 dark:bg-primary/20 dark:text-chart-1 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold">
              <Leaf className="h-3.5 w-3.5" />
              Gestão de análises agronômicas
            </span>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Transforme visitas técnicas em{" "}
              <span className="from-chart-1 to-primary bg-gradient-to-br bg-clip-text text-transparent">
                relatórios que impressionam
              </span>
            </h1>

            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty">
              O AgroAnalise ajuda agrônomos e consultores a documentar análises
              com fotos, organizar fazendas e compartilhar relatórios
              profissionais com os clientes — tudo em um link.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="from-chart-1 to-primary shadow-primary/20 hover:from-chart-1/90 hover:to-primary/80 bg-gradient-to-br text-white shadow-lg"
              >
                <Link href="/register">
                  Começar gratuitamente
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Já tenho conta</Link>
              </Button>
            </div>

            <p className="text-muted-foreground mt-5 flex items-center justify-center gap-1.5 text-xs">
              <Check className="text-primary h-3.5 w-3.5" />
              Sem cartão de crédito • Pronto em minutos
            </p>
          </div>

          {/* Product preview */}
          <div className="relative mx-auto mt-16 max-w-4xl">
            <div className="from-primary/30 to-chart-1/20 dark:from-chart-1/10 dark:to-primary/10 absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br blur-2xl" />
            <ReportMockup />
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-muted/30 border-y">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { v: "100%", l: "Online e acessível" },
            { v: "1 link", l: "Para compartilhar" },
            { v: "Minutos", l: "Por relatório" },
            { v: "∞", l: "Fotos por análise" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-primary dark:text-chart-1 text-3xl font-bold tracking-tight">
                {s.v}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-primary dark:text-chart-1 text-xs font-semibold tracking-[0.2em] uppercase">
              Recursos
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Tudo para o seu trabalho de campo
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Da visita à entrega do relatório, sem planilhas nem documentos
              soltos.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group bg-card relative overflow-hidden rounded-2xl border p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-chart-1 flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="como-funciona"
        className="bg-muted/30 border-y py-20 sm:py-28"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-primary dark:text-chart-1 text-xs font-semibold tracking-[0.2em] uppercase">
              Como funciona
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Do campo ao cliente em 3 passos
            </h2>
          </div>

          <div className="relative mt-14 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.n} className="relative">
                <div className="bg-card rounded-2xl border p-7 shadow-sm">
                  <span className="text-primary/25 dark:text-chart-1/30 text-4xl font-bold tabular-nums">
                    {s.n}
                  </span>
                  <h3 className="mt-3 text-xl font-semibold">{s.title}</h3>
                  <p className="text-muted-foreground mt-2 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="text-muted-foreground/40 absolute top-1/2 -right-6 hidden h-6 w-6 -translate-y-1/2 md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reports showcase */}
      <section id="relatorios" className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <span className="text-primary dark:text-chart-1 text-xs font-semibold tracking-[0.2em] uppercase">
              Relatórios públicos
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Um link que valoriza o seu trabalho
            </h2>
            <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
              Cada análise vira uma página elegante, com as fotos em destaque e
              a sua descrição técnica. O produtor abre em qualquer dispositivo,
              sem instalar nada.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                {
                  icon: Camera,
                  t: "Fotos em destaque",
                  d: "Galeria com visualização ampliada e legendas técnicas.",
                },
                {
                  icon: Link2,
                  t: "Acesso por link",
                  d: "Compartilhe por WhatsApp, e-mail ou QR Code.",
                },
                {
                  icon: Clock,
                  t: "Sempre disponível",
                  d: "O cliente acessa quando quiser, de onde estiver.",
                },
              ].map((item) => (
                <li key={item.t} className="flex gap-3.5">
                  <span className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-chart-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-semibold">{item.t}</p>
                    <p className="text-muted-foreground text-sm">{item.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="from-primary/30 to-chart-1/20 dark:from-chart-1/10 dark:to-primary/10 absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br blur-2xl" />
            <ReportMockup compact />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="from-primary to-primary/40 relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br px-6 py-16 text-center shadow-xl sm:px-12 sm:py-20">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="bg-chart-1/10 absolute -bottom-24 -left-24 h-72 w-72 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Pronto para impressionar seus clientes?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
              Crie sua conta e gere o seu primeiro relatório agronômico hoje
              mesmo.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="text-primary bg-white hover:bg-white/90"
              >
                <Link href="/register">
                  Começar gratuitamente
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/login">Entrar</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="from-chart-1 to-primary flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white">
              <Sprout className="h-4 w-4" />
            </span>
            <span className="font-bold tracking-tight">AgroAnalise</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} AgroAnalise. Gestão de análises
            agronômicas.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Stylized preview of a public analysis report. */
function ReportMockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className="bg-card overflow-hidden rounded-2xl border shadow-2xl">
      {/* Browser chrome */}
      <div className="bg-muted/60 flex items-center gap-2 border-b px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400/70" />
          <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
          <span className="bg-primary/70 h-3 w-3 rounded-full" />
        </div>
        <div className="bg-background text-muted-foreground ml-3 flex flex-1 items-center gap-1.5 rounded-md px-3 py-1 text-xs">
          <Link2 className="h-3 w-3" />
          agroanalise.com/a/relatorio-tecnico
        </div>
      </div>

      {/* Faux hero */}
      <div className="from-primary via-primary/80 to-primary/40 relative flex h-40 items-end bg-gradient-to-br p-5 sm:h-48">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative">
          <span className="bg-chart-1/90 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white">
            <Sprout className="h-2.5 w-2.5" /> Análise
          </span>
          <p className="mt-2 text-xl font-bold text-white sm:text-2xl">
            Lavoura de Soja — Talhão 4
          </p>
          <p className="text-xs text-white/70">Fazenda Santa Helena • MT</p>
        </div>
      </div>

      {/* Faux content */}
      <div className="space-y-4 p-5">
        {!compact && (
          <div className="grid grid-cols-3 gap-2">
            {[
              { i: Clock, l: "12 mai 2026" },
              { i: Camera, l: "8 fotos" },
              { i: MapPin, l: "Sorriso - MT" },
            ].map((s) => (
              <div
                key={s.l}
                className="bg-muted/50 flex items-center gap-2 rounded-lg p-2.5"
              >
                <s.i className="text-primary dark:text-chart-1 h-3.5 w-3.5" />
                <span className="text-[11px] font-medium">{s.l}</span>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-5 items-center gap-3">
          <div className="from-primary/20 to-primary/40 dark:from-primary/40 dark:to-primary/30 col-span-3 aspect-[4/3] rounded-xl bg-gradient-to-br" />
          <div className="col-span-2 space-y-1.5">
            <div className="text-primary/30 dark:text-chart-1/40 text-2xl font-bold">
              01
            </div>
            <div className="bg-muted h-2 w-full rounded-full" />
            <div className="bg-muted h-2 w-4/5 rounded-full" />
            <div className="bg-muted h-2 w-3/5 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-5 items-center gap-3">
          <div className="order-2 col-span-2 space-y-1.5 text-right">
            <div className="text-primary/30 dark:text-chart-1/40 text-2xl font-bold">
              02
            </div>
            <div className="bg-muted ml-auto h-2 w-full rounded-full" />
            <div className="bg-muted ml-auto h-2 w-4/5 rounded-full" />
          </div>
          <div className="from-chart-1/20 to-primary/30 dark:from-chart-1/30 dark:to-primary/30 order-1 col-span-3 aspect-[4/3] rounded-xl bg-gradient-to-br" />
        </div>
      </div>
    </div>
  );
}
