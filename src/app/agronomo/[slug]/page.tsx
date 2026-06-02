import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  ImageIcon,
  Leaf,
  MapPin,
  MessageCircle,
  Phone,
  Sprout,
  Users,
} from "lucide-react";
import { api } from "~/trpc/server";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { whatsappLink } from "~/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

function initials(name: string | null | undefined, fallback: string) {
  return (name ?? fallback)
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await api.user.getPublicProfile({ slug });
  if (!data) return { title: "Agrônomo não encontrado" };

  const title = `${data.name}${data.company ? ` — ${data.company}` : " — Agrônomo"}`;
  const description =
    data.bio ??
    `Conheça o trabalho de ${data.name} e entre em contato para uma análise agronômica.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: data.image ? [{ url: data.image }] : undefined,
    },
  };
}

export default async function AgronomistPublicPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await api.user.getPublicProfile({ slug });

  if (!data) {
    notFound();
  }

  const { name, image, phone, company, bio, specialties, stats, portfolio } =
    data;

  const whatsapp = whatsappLink(
    phone,
    `Olá ${name}, vi sua página no AgroAnalise e gostaria de conversar sobre uma análise agronômica.`,
  );
  const memberYear = new Date(data.memberSince).getFullYear();

  return (
    <div className="bg-background min-h-screen">
      {/* Floating top bar */}
      <header className="fixed top-0 right-0 left-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-full bg-black/20 py-1.5 pr-4 pl-1.5 text-white shadow-lg ring-1 ring-white/15 backdrop-blur-md"
          >
            <Image
              src="/logo-mini.png"
              alt="AgroAnalise"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full"
            />
            <span className="text-sm font-semibold tracking-tight">
              AgroAnalise
            </span>
          </Link>
          <span className="hidden items-center gap-1.5 rounded-full bg-black/20 px-3.5 py-2 text-xs font-medium text-white shadow-lg ring-1 ring-white/15 backdrop-blur-md sm:flex">
            <Leaf className="h-3.5 w-3.5" />
            Consultor Agronômico
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="from-primary via-primary/80 to-primary/40 dark:from-background dark:via-primary/20 dark:to-background absolute inset-0 bg-gradient-to-br" />
        <div className="bg-chart-1/20 absolute -top-24 -right-24 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-chart-1/10 absolute -bottom-32 -left-24 h-96 w-96 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 pt-32 pb-20 sm:px-6 sm:pt-40 sm:pb-24 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-32 w-32 ring-4 shadow-2xl ring-white/30 sm:h-40 sm:w-40">
              <AvatarImage
                src={image ?? undefined}
                alt={name}
                className="object-cover"
              />
              <AvatarFallback className="bg-white/20 text-4xl font-semibold text-white">
                {initials(name, "A")}
              </AvatarFallback>
            </Avatar>

            <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/25 backdrop-blur">
              <Sprout className="h-3.5 w-3.5" />
              Engenheiro(a) Agrônomo(a)
            </span>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
              {name}
            </h1>

            {company && (
              <p className="mt-3 flex items-center gap-1.5 text-lg font-medium text-white/85">
                <Building2 className="h-4 w-4" />
                {company}
              </p>
            )}

            {bio && (
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
                {bio}
              </p>
            )}

            {specialties.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {specialties.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
              {whatsapp ? (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-black/20 transition-transform hover:scale-[1.03]"
                >
                  <MessageCircle className="h-5 w-5" />
                  Conversar no WhatsApp
                </a>
              ) : phone ? (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-primary shadow-xl shadow-black/20 transition-transform hover:scale-[1.03]"
                >
                  <Phone className="h-5 w-5" />
                  Ligar agora
                </a>
              ) : null}
              {whatsapp && phone && (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
                >
                  <Phone className="h-5 w-5" />
                  Ligar
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Stats strip — overlaps the hero */}
        <div className="bg-border relative z-10 -mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border shadow-xl sm:grid-cols-3">
          <Stat
            icon={<Users className="h-5 w-5" />}
            value={`${stats.clients}`}
            label={stats.clients === 1 ? "Fazenda atendida" : "Fazendas atendidas"}
          />
          <Stat
            icon={<Sprout className="h-5 w-5" />}
            value={`${stats.analyses}`}
            label={
              stats.analyses === 1 ? "Análise realizada" : "Análises realizadas"
            }
          />
          <Stat
            icon={<Calendar className="h-5 w-5" />}
            value={`${memberYear}`}
            label="No AgroAnalise desde"
          />
        </div>

        {/* Specialties / services */}
        {specialties.length > 0 && (
          <section className="pt-16 sm:pt-20">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-primary dark:text-chart-1 text-xs font-semibold tracking-[0.2em] uppercase">
                Áreas de atuação
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Especialidades
              </h2>
              <p className="text-muted-foreground mt-3">
                Serviços e áreas em que {name.split(" ")[0]} pode ajudar a sua
                propriedade.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {specialties.map((s) => (
                <div
                  key={s}
                  className="bg-card flex items-center gap-3 rounded-2xl border p-5 shadow-sm"
                >
                  <span className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-chart-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <span className="font-medium">{s}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Portfolio — recent public analyses */}
        {portfolio.length > 0 && (
          <section className="pt-16 sm:pt-20">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-primary dark:text-chart-1 text-xs font-semibold tracking-[0.2em] uppercase">
                Trabalhos recentes
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Análises realizadas
              </h2>
              <p className="text-muted-foreground mt-3">
                Exemplos de relatórios técnicos produzidos por {name.split(" ")[0]}.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {portfolio.map((a) => (
                <Link
                  key={a.id}
                  href={`/a/${a.slug}`}
                  className="group bg-card relative flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="bg-muted relative aspect-[4/3] overflow-hidden">
                    {a.cover ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={a.cover}
                          alt={a.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      </>
                    ) : (
                      <div className="text-muted-foreground flex h-full items-center justify-center">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                    <span className="bg-chart-1/90 absolute top-3 left-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow backdrop-blur">
                      <Sprout className="h-3 w-3" />
                      Análise
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="line-clamp-2 font-semibold transition-colors group-hover:text-primary dark:group-hover:text-chart-1">
                      {a.title}
                    </h3>
                    <div className="text-muted-foreground mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(a.visitDate).toLocaleDateString("pt-BR")}
                      </span>
                      {a.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {a.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="absolute right-4 bottom-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-900 opacity-0 shadow transition-opacity group-hover:opacity-100">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Contact CTA */}
        <section className="pt-16 pb-4 sm:pt-24">
          <div className="from-primary to-primary/40 dark:from-primary/30 dark:to-background relative overflow-hidden rounded-3xl border bg-gradient-to-br px-6 py-14 text-center shadow-xl sm:px-12 sm:py-20">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="bg-chart-1/10 absolute -bottom-24 -left-24 h-72 w-72 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Precisa de uma análise na sua propriedade?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
                Fale com {name.split(" ")[0]} e agende uma visita técnica. A
                resposta costuma ser rápida pelo WhatsApp.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {whatsapp && (
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-black/20 transition-transform hover:scale-[1.03]"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Chamar no WhatsApp
                  </a>
                )}
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-primary shadow-lg transition-transform hover:scale-[1.03]"
                  >
                    <Phone className="h-5 w-5" />
                    {phone}
                  </a>
                )}
              </div>
              {!whatsapp && !phone && (
                <p className="mt-6 text-white/80">
                  Contato ainda não informado por este profissional.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t">
        <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 text-center sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-mini.png"
              alt="AgroAnalise"
              width={28}
              height={28}
              className="h-7 w-7 rounded-md"
            />
            <span className="text-foreground text-sm font-semibold">
              AgroAnalise
            </span>
          </Link>
          <p className="text-xs">
            Página profissional gerada no AgroAnalise.{" "}
            <Link
              href="/register"
              className="text-primary dark:text-chart-1 font-medium hover:underline"
            >
              Crie a sua também
              <ArrowRight className="ml-0.5 inline h-3 w-3" />
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="bg-card flex items-center gap-3 p-5">
      <div className="text-muted-foreground bg-primary/10 text-primary dark:bg-primary/20 dark:text-chart-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold tracking-tight">{value}</p>
        <p className="text-muted-foreground text-xs font-medium tracking-wide">
          {label}
        </p>
      </div>
    </div>
  );
}
