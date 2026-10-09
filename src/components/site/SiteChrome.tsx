import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, Heart, Moon, Sun } from "lucide-react";
import { SUPPORT_URL } from "@/lib/share-constants";
import { Button } from "@/components/ui/button";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight" aria-label="DropCode home">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary font-mono text-sm font-bold text-primary-foreground">D</span>
      DropCode
    </Link>
  );
}

const nav = [
  { to: "/how-it-works", label: "How it works" },
  { to: "/faq", label: "FAQ" },
  { to: "/blog", label: "Blog" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav aria-label="Main" className="flex items-center gap-4 text-sm text-muted-foreground sm:gap-6">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>
              {n.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

const cols = [
  { title: "Tool", links: [{ to: "/", label: "Send & receive" }, { to: "/online-text-sharing", label: "Online text sharing" }, { to: "/share-files-online", label: "Share files online" }] },
  { title: "Info", links: [{ to: "/how-it-works", label: "How it works" }, { to: "/faq", label: "FAQ" }, { to: "/blog", label: "Blog" }, { to: "/about", label: "About" }, { to: "/contact", label: "Contact" }] },
  { title: "Legal", links: [{ to: "/privacy", label: "Privacy" }, { to: "/terms", label: "Terms" }] },
] as const;

export function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="h-8 w-8 border-border text-foreground transition hover:border-primary/50"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

export function AboutDeveloper() {
  return (
    <section aria-labelledby="dev" className="mx-auto max-w-3xl px-4 pt-24">
      <div className="panel flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary font-mono text-2xl font-bold text-primary-foreground" aria-hidden>
          MS
        </span>
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">About the developer</p>
          <h2 id="dev" className="mt-1 text-xl font-bold">Madhav Singla</h2>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start">
            <GraduationCap className="h-4 w-4" aria-hidden /> B.Tech CSE student
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Built DropCode to make moving things between your own devices fast, free and private — no accounts, no apps.
          </p>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">Move text and files between devices with a one-time code.</p>
          <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
            <Heart className="h-4 w-4" /> Support this project
          </a>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h2 className="mb-3 text-sm font-semibold">{c.title}</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {c.links.map((l) => (
                <li key={l.to}><Link to={l.to} className="hover:text-foreground">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="pb-8 text-center text-xs text-muted-foreground">© 2026 DropCode · Built by Madhav Singla</p>
    </footer>
  );
}

export function PageShell({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-4 pt-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {intro && <p className="mt-3 text-lg text-muted-foreground">{intro}</p>}
      <div className="mt-10">{children}</div>
    </main>
  );
}
