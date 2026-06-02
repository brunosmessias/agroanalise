import { ThemeSwitch } from "~/components/theme-switch";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-background to-green-50">
      <div className="absolute right-4 top-4">
        <ThemeSwitch />
      </div>
      {children}
    </div>
  );
}
