import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "~/components/theme-provider";
import { TooltipProvider } from "~/components/ui/tooltip";

export const metadata: Metadata = {
  title: {
    default: "AgroAnalise — Relatórios agronômicos que impressionam",
    template: "%s | AgroAnalise",
  },
  description:
    "Documente visitas técnicas com fotos e análises, e compartilhe relatórios profissionais com seus clientes em um link. Gestão de fazendas e análises agronômicas.",
  icons: [
    { rel: "icon", url: "/logo-mini.png", sizes: "400x390", type: "image/png" },
    { rel: "apple-touch-icon", url: "/logo-mini.png" },
  ],
  openGraph: {
    title: "AgroAnalise — Relatórios agronômicos que impressionam",
    description:
      "Documente visitas técnicas com fotos e análises, e compartilhe relatórios profissionais com seus clientes em um link.",
    siteName: "AgroAnalise",
    images: [{ url: "/logo-full-1x.png", width: 400, height: 275 }],
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const THEME_SCRIPT = `
(function() {
  try {
    var theme = localStorage.getItem('agroanalise-theme') || 'system';
    var dark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.add(dark ? 'dark' : 'light');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${geist.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          <TRPCReactProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </TRPCReactProvider>
        </ThemeProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
