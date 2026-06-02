import { ThemeSwitch } from "~/components/theme-switch";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="via-background dark:from-primary dark:to-background relative flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="absolute top-4 right-4">
        <ThemeSwitch />
      </div>
      {children}
    </div>
  );
}
