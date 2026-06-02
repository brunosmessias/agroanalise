"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

const links = [
  { href: "#recursos", label: "Recursos" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#relatorios", label: "Relatórios" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo-mini.png"
            alt="AgroAnalise"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <span className="text-lg font-bold tracking-tight">AgroAnalise</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-muted-foreground hover:text-foreground rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-gradient-to-br from-chart-1 to-primary text-white hover:from-chart-1/90 hover:to-primary/80"
          >
            <Link href="/register">Começar agora</Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="hover:bg-accent flex h-9 w-9 items-center justify-center rounded-lg md:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="bg-background/95 border-t backdrop-blur-xl md:hidden">
          <div className="space-y-1 px-4 py-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="hover:bg-accent block rounded-lg px-3 py-2.5 text-sm font-medium"
              >
                {l.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              <Button asChild variant="outline">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-br from-chart-1 to-primary text-white"
              >
                <Link href="/register">Começar agora</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
