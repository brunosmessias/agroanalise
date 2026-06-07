import Image from "next/image";
import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Calendar,
  ImageIcon,
  Mail,
  MapPin,
  Phone,
  Sprout,
  Building2,
  IdCard,
  ImageOff,
  Leaf,
  ArrowUpRight,
} from "lucide-react";
import { GalleryLightbox } from "./gallery-lightbox";
import { ExportPdfButton } from "~/components/pdf/export-pdf-button";

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

export default async function PublicAnalysisPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await api.analyses.getBySlug({ slug });

  if (!data) {
    notFound();
  }

  const { title, description, visitDate, client, agronomist, photos } = data;

  const farmInitials = initials(client?.name, "F");
  const agronomistInitials = initials(agronomist?.name, "T");
  const location = [client?.city, client?.state].filter(Boolean).join(" - ");
  const photoCount = photos.length;
  const cover = photos[0];

  const formattedDate = new Date(visitDate).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-background min-h-screen">
      {/* Floating top bar */}
      <header className="fixed top-0 right-0 left-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 rounded-full bg-black/20 py-1.5 pr-4 pl-1.5 text-white shadow-lg ring-1 ring-white/15 backdrop-blur-md">
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
          </div>
          <span className="hidden items-center gap-1.5 rounded-full bg-black/20 px-3.5 py-2 text-xs font-medium text-white shadow-lg ring-1 ring-white/15 backdrop-blur-md sm:flex">
            <Leaf className="h-3.5 w-3.5" />
            Relatório Técnico
          </span>
          <ExportPdfButton
            slug={slug}
            label="Baixar PDF"
            variant="secondary"
            size="sm"
          />
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[20vh] items-end overflow-hidden">
        {/* Background */}
        {cover ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full scale-105 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
          </>
        ) : (
          <div className="from-primary via-primary/70 absolute inset-0 bg-gradient-to-br to-stone-900">
            <div className="bg-chart-1/20 absolute -top-24 -right-24 h-96 w-96 rounded-full blur-3xl" />
            <div className="bg-chart-1/10 absolute -bottom-24 -left-24 h-96 w-96 rounded-full blur-3xl" />
          </div>
        )}

        <div className="relative mx-auto w-full max-w-6xl px-4 pt-28 pb-14 sm:px-6 sm:pb-16 lg:px-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="bg-chart-1/90 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-lg backdrop-blur">
              <Sprout className="h-3.5 w-3.5" />
              Análise
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/25 backdrop-blur">
              <Calendar className="h-3.5 w-3.5" />
              {formattedDate}
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
            {title}
          </h1>

          {description && (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
              {description}
            </p>
          )}

          {client && (
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-white/90">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 ring-2 ring-white/40">
                  <AvatarImage
                    src={client.image ?? undefined}
                    alt={client.name}
                  />
                  <AvatarFallback className="bg-primary font-semibold text-white">
                    {farmInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-[11px] font-medium tracking-wider text-white/60 uppercase">
                    Fazenda
                  </p>
                  <p className="font-semibold">{client.name}</p>
                </div>
              </div>
              {location && (
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <MapPin className="text-chart-1 h-4 w-4" />
                  {location}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Stats strip — overlaps the hero */}
        <div className="bg-border relative z-10 -mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border shadow-xl sm:grid-cols-3">
          <Stat
            icon={<Calendar className="h-5 w-5" />}
            label="Data da análise"
            value={formattedDate}
          />
          <Stat
            icon={<ImageIcon className="h-5 w-5" />}
            label="Registros fotográficos"
            value={`${photoCount} foto${photoCount === 1 ? "" : "s"}`}
          />
          <Stat
            icon={<MapPin className="h-5 w-5" />}
            label="Localização"
            value={location || "Não informada"}
            className="col-span-2 sm:col-span-1"
          />
        </div>

        {/* Photo story — the heart of the report */}
        <section className="pt-14">
          <div className="mb-10 sm:mb-14">
            <span className="text-primary dark:text-chart-1 text-xs font-semibold tracking-[0.2em] uppercase">
              Análise Fotográfica
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Registros fotográficos
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              {photoCount > 0
                ? `${photoCount} registro${photoCount === 1 ? "" : "s"} fotográfico${photoCount === 1 ? "" : "s"}, cada um com a descrição técnica do agrônomo.`
                : "Documentação visual da análise."}
            </p>
          </div>

          {photoCount > 0 ? (
            <GalleryLightbox photos={photos} />
          ) : (
            <div className="text-muted-foreground flex flex-col items-center justify-center rounded-2xl border border-dashed py-20">
              <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <ImageOff className="h-7 w-7" />
              </div>
              <p className="font-medium">Nenhuma foto nesta análise</p>
              <p className="mt-1 text-sm">
                As fotos da análise serão exibidas aqui
              </p>
            </div>
          )}
        </section>

        {/* Supporting context */}
        <div className="mt-20 grid gap-6 border-t pt-12 pb-4 lg:grid-cols-5">
          {/* Farm details */}
          {client && (
            <div className="bg-card rounded-2xl border p-6 shadow-sm sm:p-8 lg:col-span-3">
              <div className="mb-6 flex items-center gap-3">
                <div className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-chart-1 flex h-10 w-10 items-center justify-center rounded-xl">
                  <Sprout className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Dados da Fazenda</h2>
                  <p className="text-muted-foreground text-sm">
                    Propriedade e localização
                  </p>
                </div>
              </div>

              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                <Field label="Nome da fazenda" value={client.name} />
                {client.document && (
                  <Field
                    icon={<IdCard className="h-3.5 w-3.5" />}
                    label="CPF / CNPJ"
                    value={client.document}
                  />
                )}
                {client.address && (
                  <Field
                    icon={<MapPin className="h-3.5 w-3.5" />}
                    label="Endereço"
                    value={
                      <>
                        {client.address}
                        {location && (
                          <span className="text-muted-foreground block font-normal">
                            {location}
                          </span>
                        )}
                      </>
                    }
                  />
                )}
                {client.phone && (
                  <Field
                    icon={<Phone className="h-3.5 w-3.5" />}
                    label="Telefone"
                    value={
                      <a
                        href={`tel:${client.phone}`}
                        className="hover:text-primary transition-colors"
                      >
                        {client.phone}
                      </a>
                    }
                  />
                )}
                {client.email && (
                  <Field
                    icon={<Mail className="h-3.5 w-3.5" />}
                    label="Email"
                    value={
                      <a
                        href={`mailto:${client.email}`}
                        className="hover:text-primary break-all transition-colors"
                      >
                        {client.email}
                      </a>
                    }
                  />
                )}
              </dl>

              {client.notes && (
                <div className="mt-6 rounded-xl border border-dashed p-4">
                  <p className="text-muted-foreground mb-1.5 text-xs font-medium tracking-wider uppercase">
                    Observações
                  </p>
                  <p className="text-sm leading-relaxed">{client.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Agronomist card */}
          {agronomist && (
            <div className="from-primary dark:from-background to-primary/40 relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 text-white shadow-sm sm:p-8 lg:col-span-2">
              <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
              <p className="text-chart-1/80 relative text-[11px] font-semibold tracking-wider uppercase dark:text-white">
                Responsável Técnico
              </p>
              <div className="relative mt-5 flex items-center gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-white/30">
                  <AvatarImage
                    src={agronomist.image ?? undefined}
                    alt={agronomist.name}
                  />
                  <AvatarFallback className="bg-white/20 text-lg font-semibold text-white">
                    {agronomistInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xl font-bold">{agronomist.name}</p>
                  {agronomist.company && (
                    <p className="text-chart-1/90 mt-0.5 flex items-center gap-1.5 text-sm dark:text-white/60">
                      <Building2 className="h-3.5 w-3.5" />
                      {agronomist.company}
                    </p>
                  )}
                </div>
              </div>

              <div className="relative mt-6 space-y-1 border-t border-white/15 pt-5">
                {agronomist.email && (
                  <a
                    href={`mailto:${agronomist.email}`}
                    className="group flex items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors hover:bg-white/10"
                  >
                    <span className="flex items-center gap-2.5">
                      <Mail className="text-chart-1/70 h-4 w-4" />
                      <span className="break-all">{agronomist.email}</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                )}
                {agronomist.phone && (
                  <a
                    href={`tel:${agronomist.phone}`}
                    className="group flex items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors hover:bg-white/10"
                  >
                    <span className="flex items-center gap-2.5">
                      <Phone className="text-chart-1/70 h-4 w-4" />
                      {agronomist.phone}
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="pb-12" />
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-10 text-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
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
          </div>
          <p className="text-xs">
            Relatório técnico gerado em{" "}
            {new Date().toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </footer>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`bg-card flex items-center gap-3 p-5 ${className ?? ""}`}>
      <div className="text-muted-foreground bg-primary/10 text-primary dark:bg-primary/20 dark:text-chart-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
          {label}
        </p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-muted-foreground mb-1 flex items-center gap-1.5 text-[11px] font-medium tracking-wider uppercase">
        {icon}
        {label}
      </dt>
      <dd className="text-sm font-semibold">{value}</dd>
    </div>
  );
}
