import type { Metadata } from "next";
import { LoginForm } from "~/components/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse sua conta AgroAnalise",
};

export default function LoginPage() {
  return <LoginForm />;
}
