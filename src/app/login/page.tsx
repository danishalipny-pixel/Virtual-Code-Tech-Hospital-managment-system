import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/LoginForm";

export const metadata: Metadata = {
  title: "Staff Login",
  description: "Sign in to MedAxis Hospital Management System with role-based access.",
};

export default function LoginPage() {
  return (
    <main id="main-content">
      <LoginForm />
    </main>
  );
}
