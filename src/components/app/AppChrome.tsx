import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "./ThemeToggle";

export function Mark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="10" stroke="currentColor" strokeOpacity="0.45" />
      <path
        d="M11 3v16M3 11h16"
        stroke="currentColor"
        strokeOpacity="0.6"
        strokeWidth="0.75"
      />
      <circle cx="11" cy="11" r="2.2" fill="var(--emerald-muted)" />
    </svg>
  );
}

export function SiteHeader({
  variant = "landing",
}: {
  variant?: "landing" | "auth" | "app";
}) {
  return (
    <header className="border-b border-border/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <Link to="/" className="flex items-center gap-2.5">
          <Mark />
          <span className="font-display text-xl tracking-tight text-foreground">
            LedgerOath
          </span>
        </Link>

        {variant === "landing" ? (
          <nav className="hidden items-center gap-9 text-sm text-muted-foreground md:flex">
            {[
              { href: "/#product", label: "Product" },
              { href: "/#decision-room-full", label: "Decision Room" },
              { href: "/#audit-dossier", label: "Dossier" },
              { href: "/#architecture", label: "Architecture" },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-muted/50"
              >
                {l.label}
              </a>
            ))}
          </nav>
        ) : variant === "app" ? (
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <Link
              to="/app"
              activeProps={{ className: "text-foreground border-b border-emerald-muted/60" }}
              className="rounded-sm pb-0.5 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-muted/50"
            >
              Workspace
            </Link>
            <a
              href="/#command-center"
              className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-muted/50"
            >
              Command Center
            </a>
            <a
              href="/#audit-dossier"
              className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-muted/50"
            >
              Dossier
            </a>
          </nav>
        ) : null}

        <div className="flex items-center gap-4">
          <div className="border-r border-border pr-4">
            <ThemeToggle />
          </div>
          {variant !== "auth" ? (
            <Link
              to="/login"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:inline"
            >
              Sign in
            </Link>
          ) : null}
          {variant === "app" ? (
            <Link
              to="/"
              className="rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.18em] text-ivory-muted transition-colors hover:border-ivory/40 hover:text-foreground"
            >
              Back to landing
            </Link>
          ) : (
            <Link
              to="/signup"
              className="hidden rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.18em] text-ivory-muted transition-colors hover:border-ivory/40 hover:text-foreground md:inline-flex"
            >
              Request access
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-secondary/20">
      <div className="mx-auto grid max-w-7xl gap-4 px-6 py-9 text-xs text-muted-foreground sm:grid-cols-3 sm:items-center lg:px-10">
        <div className="flex items-center gap-2.5 justify-self-start">
          <Mark />
          <span className="font-display text-base text-foreground">LedgerOath</span>
          <span className="ml-2 text-ivory-muted">© {new Date().getFullYear()}</span>
        </div>
        <div className="text-center font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/80">
          Built for enterprise finance · Simulated environment
        </div>
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="justify-self-end rounded-full border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/80 transition-colors duration-200 hover:border-ivory/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-muted/50"
        >
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}

export function DemoBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-muted/30 bg-emerald-muted/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-muted">
      <span className="h-1 w-1 rounded-full bg-emerald-muted" />
      Public demo mode
    </div>
  );
}
