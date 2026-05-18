import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { SiteFooter, SiteHeader, Mark } from "@/components/app/AppChrome";
import { Field, PrimaryButton } from "@/routes/login";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Request access — LedgerOath" },
      {
        name: "description",
        content:
          "Create a LedgerOath workspace for autonomous B2B payment governance.",
      },
    ],
  }),
  component: SignupPage,
});

const USE_CASES = [
  "CFO / Finance",
  "Procurement",
  "Compliance",
  "AI Operations",
  "Founder / Builder",
  "Other",
];

function SignupPage() {
  return (
    <div className="min-h-screen bg-background text-foreground grain">
      <SiteHeader variant="auth" />
      <main className="mx-auto grid max-w-7xl gap-16 px-6 py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:px-10 lg:py-24">
        <LeftPanel />
        <SignupCard />
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
        Request a governance workspace.
      </h1>
      <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
        Provision a dedicated review surface for your finance, procurement, and
        compliance teams. Every payment instruction passes through policy,
        vendor, and approval checks before release.
      </p>
      <ul className="mt-10 space-y-3 text-sm text-muted-foreground">
        {[
          "Deterministic policy + risk scoring",
          "Dual-control approval routing",
          "Exportable audit dossier",
        ].map((t) => (
          <li key={t} className="flex items-start gap-3">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-muted" />
            <span>{t}</span>
          </li>
        ))}
      </ul>
      <div className="mt-10 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ivory-muted">
        <span className="h-1 w-1 rounded-full bg-amber-restrained" />
        Simulated environment for hackathon review
      </div>
    </div>
  );
}

function SignupCard() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [useCase, setUseCase] = useState(USE_CASES[0]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = "Full name is required";
    if (!email.trim()) next.email = "Work email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Enter a valid work email";
    if (!company.trim()) next.company = "Company is required";
    if (!role.trim()) next.role = "Role is required";
    if (password.length < 8)
      next.password = "Password must be at least 8 characters";
    if (confirm !== password) next.confirm = "Passwords do not match";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1100));
    setLoading(false);
    toast.success(
      "Workspace request captured for demo. Connect Lovable Cloud / Supabase Auth in the backend phase.",
    );
    navigate({ to: "/app" });
  }

  return (
    <div className="flex items-center">
      <div className="w-full rounded-2xl border border-border bg-card/70 p-8 shadow-soft backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ivory-muted">
            Request access
          </span>
          <span className="font-mono text-[10px] text-ivory-muted/60">
            Workspace provisioning
          </span>
        </div>
        <form onSubmit={onSubmit} className="mt-6 grid gap-5 sm:grid-cols-2" noValidate>
          <div className="sm:col-span-2">
            <Field
              label="Full name"
              id="fullName"
              value={fullName}
              onChange={setFullName}
              error={errors.fullName}
              placeholder="Leena Ramaswamy"
              autoComplete="name"
            />
          </div>
          <Field
            label="Work email"
            id="email"
            type="email"
            value={email}
            onChange={setEmail}
            error={errors.email}
            placeholder="leena@company.com"
            autoComplete="email"
          />
          <Field
            label="Company"
            id="company"
            value={company}
            onChange={setCompany}
            error={errors.company}
            placeholder="Northline Systems"
            autoComplete="organization"
          />
          <Field
            label="Role"
            id="role"
            value={role}
            onChange={setRole}
            error={errors.role}
            placeholder="Finance Controller"
          />
          <div>
            <label
              htmlFor="useCase"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-ivory-muted/80"
            >
              Intended use case
            </label>
            <select
              id="useCase"
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              className="mt-2 w-full rounded-md border border-border bg-background/60 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-muted/40"
            >
              {USE_CASES.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <Field
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
          <Field
            label="Confirm password"
            id="confirm"
            type="password"
            value={confirm}
            onChange={setConfirm}
            error={errors.confirm}
            placeholder="Repeat password"
            autoComplete="new-password"
          />
          <div className="sm:col-span-2">
            <PrimaryButton type="submit" loading={loading}>
              {loading ? "Provisioning…" : "Create workspace"}
            </PrimaryButton>
          </div>
          <div className="sm:col-span-2">
            <Link
              to="/"
              className="block w-full rounded-full border border-border px-5 py-3 text-center text-sm text-ivory-muted transition-colors hover:border-ivory/40 hover:text-foreground"
            >
              Continue as public demo
            </Link>
          </div>
          <div className="sm:col-span-2 border-t border-border pt-5 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </div>
          <p className="sm:col-span-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ivory-muted/60">
            Auth-ready · backend connection pending
          </p>
        </form>
      </div>
    </div>
  );
}
