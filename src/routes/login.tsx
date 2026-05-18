import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { SiteFooter, SiteHeader, Mark } from "@/components/app/AppChrome";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — LedgerOath governance console" },
      {
        name: "description",
        content:
          "Enter the LedgerOath governance console to review payment risk, approval routes, and audit dossiers before money moves.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="min-h-screen bg-background text-foreground grain">
      <SiteHeader variant="auth" />
      <main className="mx-auto grid max-w-7xl gap-16 px-6 py-16 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:px-10 lg:py-24">
        <LeftPanel />
        <SignInCard />
      </main>
      <SiteFooter />
      <Toaster />
    </div>
  );
}

function LeftPanel() {
  return (
    <div className="flex flex-col justify-center">
      <div className="flex items-center gap-2.5 text-foreground">
        <Mark />
        <span className="font-display text-xl tracking-tight">LedgerOath</span>
      </div>
      <h1 className="mt-10 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
        Enter the governance console.
      </h1>
      <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
        Review payment risk, approval routes, and audit dossiers before money
        moves.
      </p>
      <div className="mt-10 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory-muted">
        <span className="h-1 w-1 rounded-full bg-amber-restrained" />
        Simulated environment for hackathon review
      </div>
    </div>
  );
}

function SignInCard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  function validate() {
    const next: typeof errors = {};
    if (!email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Enter a valid work email";
    if (!password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    toast.success("Auth is ready for Lovable Cloud / Supabase connection.");
    navigate({ to: "/app" });
  }

  return (
    <div className="flex items-center">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card/70 p-8 shadow-soft backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ivory-muted">
            Sign in
          </span>
          <span className="font-mono text-[10px] text-ivory-muted/60">
            v1.0 · console
          </span>
        </div>
        <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
          <Field
            label="Work email"
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={setEmail}
            error={errors.email}
            placeholder="you@company.com"
          />
          <Field
            label="Password"
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            placeholder="••••••••"
            trailing={
              <button
                type="button"
                onClick={() =>
                  toast("Password reset will activate after backend connection.")
                }
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-ivory-muted/80 hover:text-foreground"
              >
                Forgot?
              </button>
            }
          />
          <PrimaryButton type="submit" loading={loading}>
            {loading ? "Verifying…" : "Sign in"}
          </PrimaryButton>
          <Link
            to="/"
            className="block w-full rounded-full border border-border px-5 py-3 text-center text-sm text-ivory-muted transition-colors hover:border-ivory/40 hover:text-foreground"
          >
            Continue as public demo
          </Link>
          <div className="border-t border-border pt-5 text-center text-xs text-muted-foreground">
            New to LedgerOath?{" "}
            <Link
              to="/signup"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Create account
            </Link>
          </div>
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ivory-muted/60">
            Auth-ready · backend connection pending
          </p>
        </form>
      </div>
    </div>
  );
}

export function Field({
  label,
  id,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
  trailing,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={id}
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80"
        >
          {label}
        </label>
        {trailing}
      </div>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`mt-2 w-full rounded-md border bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-ivory-muted/40 focus:outline-none focus:ring-2 focus:ring-emerald-muted/40 ${
          error ? "border-destructive/60" : "border-border"
        }`}
      />
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function PrimaryButton({
  children,
  loading,
  type = "button",
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  loading?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-ivory px-6 py-3 text-sm font-medium text-navy-deep transition-all hover:bg-ivory/90 disabled:opacity-60"
    >
      {loading ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          className="animate-spin"
          aria-hidden
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeDasharray="40"
            strokeLinecap="round"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
}
