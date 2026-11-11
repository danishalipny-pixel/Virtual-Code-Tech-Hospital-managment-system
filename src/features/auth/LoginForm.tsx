"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Moon,
  ShieldCheck,
  Stethoscope,
  Sun,
  UserCheck,
} from "lucide-react";
import usersData from "@/data/users.json";
import { useHospitalStore } from "@/store/useHospitalStore";
import { useHydrated } from "@/hooks/useHydrated";
import { loginSchema, type LoginFormValues } from "./auth-schema";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Role, UserAccount } from "@/lib/types";

export function getRoleLandingRoute(role: Role): string {
  switch (role) {
    case "admin":
      return "/dashboard";
    case "doctor":
      return "/appointments";
    case "receptionist":
      return "/patients";
  }
}

const roleSummaries: Record<Role, { scope: string; landing: string }> = {
  admin: {
    scope: "Full system control, revenue analytics, doctors & demo reset",
    landing: "/dashboard",
  },
  doctor: {
    scope: "Clinical schedule, patients, wards (billing restricted)",
    landing: "/appointments",
  },
  receptionist: {
    scope: "Patient intake, appointments, billing & ward admissions",
    landing: "/patients",
  },
};

export function LoginForm() {
  const router = useRouter();
  const hydrated = useHydrated();
  const session = useHospitalStore((s) => s.session);
  const login = useHospitalStore((s) => s.login);
  const theme = useHospitalStore((s) => s.theme);
  const toggleTheme = useHospitalStore((s) => s.toggleTheme);

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (hydrated && session) {
      router.replace(getRoleLandingRoute(session.role));
    }
  }, [hydrated, session, router]);

  const onSubmit = (values: LoginFormValues) => {
    setAuthError(null);
    const result = login(values.email, values.password);
    if (!result.success || !result.user) {
      setAuthError(result.error ?? "Authentication failed.");
      return;
    }
    router.replace(getRoleLandingRoute(result.user.role));
  };

  const handleDemoFill = (account: UserAccount, autoSignIn = false) => {
    setAuthError(null);
    setValue("email", account.email, { shouldValidate: true });
    setValue("password", account.password, { shouldValidate: true });
    if (autoSignIn) {
      const result = login(account.email, account.password);
      if (result.success && result.user) {
        router.replace(getRoleLandingRoute(result.user.role));
      }
    }
  };

  const demoAccounts = usersData as UserAccount[];

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col justify-center p-4 sm:p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-5xl justify-end pb-4">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="inline-flex items-center gap-2 rounded-xl border border-sky-100 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:bg-sky-50 dark:border-slate-800 dark:bg-[#111c2e] dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
        >
          {theme === "dark" ? (
            <>
              <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-sky-600" aria-hidden="true" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-xl dark:border-slate-800 dark:bg-[#111c2e] lg:grid-cols-12">
        {/* Left Clinical Brand Showcase */}
        <div className="relative flex flex-col justify-between bg-gradient-to-br from-sky-700 via-sky-600 to-teal-600 p-8 text-white lg:col-span-5 lg:p-10">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/medaxis-logo.svg"
                alt="MedAxis HMS logo"
                width={42}
                height={42}
                className="h-10.5 w-10.5 rounded-xl bg-white/10 p-0.5 shadow-sm"
              />
              <div>
                <span className="block text-xl font-bold tracking-tight">
                  MedAxis HMS
                </span>
                <span className="block text-xs text-sky-100">
                  International Hospital Suite
                </span>
              </div>
            </div>

            <h1 className="mt-8 text-2xl font-bold leading-snug sm:text-3xl">
              Unified Clinical & Hospital Operations Platform
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-sky-100">
              Manage patient records, physician availability, real-time appointment
              calendars, ward bed capacity, and medical billing in one cohesive interface.
            </p>
          </div>

          <div className="mt-8 space-y-3 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <ShieldCheck className="h-4 w-4 text-teal-200" aria-hidden="true" />
              <span>Role-Based Access Control (RBAC)</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <Stethoscope className="h-4 w-4 text-teal-200" aria-hidden="true" />
              <span>100% Fictional Clinical Demo Environment</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <UserCheck className="h-4 w-4 text-teal-200" aria-hidden="true" />
              <span>Browser Persistence via localStorage</span>
            </div>
          </div>
        </div>

        {/* Right Sign-In & Demo Credentials */}
        <div className="p-6 sm:p-8 lg:col-span-7 lg:p-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Sign in to Portal
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Enter your staff credentials or select a demo role account below.
            </p>
          </div>

          {authError && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 dark:border-rose-800/70 dark:bg-rose-950/60 dark:text-rose-300"
            >
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
              >
                Staff Email
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@medaxis.org"
                  aria-invalid={Boolean(errors.email)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3.5 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  aria-invalid={Boolean(errors.password)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-11 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              className="w-full"
            >
              Sign In to Dashboard
            </Button>
          </form>

          {/* Demo Role Credentials */}
          <div className="mt-7 border-t border-slate-100 pt-5 dark:border-slate-800">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Demo Staff Credentials (Click to Fill or Sign In)
              </h3>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2.5">
              {demoAccounts.map((acc) => {
                const info = roleSummaries[acc.role];
                return (
                  <div
                    key={acc.id}
                    className="flex flex-col gap-2 rounded-2xl border border-sky-100 bg-sky-50/50 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge status={acc.role} className="capitalize">
                          {acc.role}
                        </Badge>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                          {acc.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          → {info.landing}
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        {acc.email} · {acc.password}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        {info.scope}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDemoFill(acc, false)}
                      >
                        Fill
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDemoFill(acc, true)}
                      >
                        Quick Sign In
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
