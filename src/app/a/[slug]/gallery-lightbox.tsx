"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { cn } from "~/lib/utils";

export interface GalleryPhoto {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  description: string;
}

export function GalleryLightbox({ photos }: { photos: GalleryPhoto[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % photos.length)),
    [photos.length],
  );
  const prev = useCallback(
    () =>
      setOpenIndex((i) =>
        i === null ? null : (i - 1 + photos.length) % photos.length,
      ),
    [photos.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, close, next, prev]);

  const active = openIndex === null ? null : photos[openIndex];

  return (
    <>
      {/* Editorial photo story — photos + captions are the main content */}
      <div className="space-y-16 sm:space-y-24">
        {photos.map((photo, idx) => {
          const flip = idx % 2 === 1;
          return (
            <article
              key={photo.id}
              className="grid items-center gap-6 lg:grid-cols-12 lg:gap-10"
            >
              {/* Image */}
              <button
                type="button"
                onClick={() => setOpenIndex(idx)}
                className={cn(
                  "group bg-muted relative block overflow-hidden rounded-3xl border shadow-md transition-shadow hover:shadow-2xl lg:col-span-7",
                  flip && "lg:order-2",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.imageUrl}
                  alt={photo.description || `Foto ${idx + 1}`}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading={idx < 2 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="absolute right-4 bottom-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-neutral-900 opacity-0 shadow-lg backdrop-blur transition-opacity group-hover:opacity-100">
                  <Maximize2 className="h-4 w-4" />
                </span>
              </button>

              {/* Caption — the text of each photo, in focus */}
              <div
                className={cn(
                  "lg:col-span-5",
                  flip && "lg:order-1 lg:text-right",
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-3",
                    flip && "lg:flex-row-reverse",
                  )}
                >
                  <span className="text-3xl font-bold text-primary/30 tabular-nums dark:text-chart-1/40">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-r from-chart-1/40 to-transparent" />
                </div>
                <p className="text-foreground mt-4 text-lg leading-relaxed font-medium sm:text-xl">
                  {photo.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {/* Lightbox */}
      {active && openIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <div className="flex items-center justify-between p-4 text-white/90">
            <span className="text-sm font-medium tabular-nums">
              {openIndex + 1} / {photos.length}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Fechar"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div
            className="relative flex flex-1 items-center justify-center px-4 pb-4"
            onClick={(e) => e.stopPropagation()}
          >
            {photos.length > 1 && (
              <button
                type="button"
                onClick={prev}
                aria-label="Anterior"
                className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-8"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            <figure className="flex max-h-full max-w-5xl flex-col items-center gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={active.imageUrl}
                alt={active.description || `Foto ${openIndex + 1}`}
                className="max-h-[72vh] w-auto rounded-lg object-contain shadow-2xl"
              />
              {active.description && (
                <figcaption className="max-w-2xl text-center text-base leading-relaxed text-white/85">
                  {active.description}
                </figcaption>
              )}
            </figure>

            {photos.length > 1 && (
              <button
                type="button"
                onClick={next}
                aria-label="Próxima"
                className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-8"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {photos.length > 1 && (
            <div
              className="flex justify-center gap-2 overflow-x-auto p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setOpenIndex(i)}
                  aria-label={`Ir para foto ${i + 1}`}
                  className={cn(
                    "h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                    i === openIndex
                      ? "border-white opacity-100"
                      : "border-transparent opacity-50 hover:opacity-80",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.thumbnailUrl || p.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
