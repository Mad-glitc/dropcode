import { ArrowLeftRight, Check, ChevronDown, ClipboardPaste, Globe, KeyRound, Laptop, MonitorSmartphone, PartyPopper, Smartphone, Timer, Trash2, UserX, Wallet, Zap, Minus } from "lucide-react";
import { FAQ } from "@/content/faq";

export function TrustStrip() {
  return (
    <p className="mt-8 text-center font-mono text-sm tracking-wide text-muted-foreground">
      No account <span className="text-primary">·</span> No app <span className="text-primary">·</span> Free
    </p>
  );
}

const steps = [
  { icon: ClipboardPaste, t: "Paste", d: "Drop in text, a link or a file." },
  { icon: KeyRound, t: "Get code", d: "A 5-character code appears instantly." },
  { icon: Smartphone, t: "Enter or scan", d: "Type it or scan the QR on the other device." },
  { icon: PartyPopper, t: "Done", d: "Content arrives and is deleted from our server." },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how" className="mx-auto max-w-6xl px-4 pt-24">
      <h2 id="how" className="text-center text-2xl font-bold sm:text-3xl">How it works</h2>
      <div className="mx-auto mt-8 flex max-w-xs items-center justify-center gap-4 text-muted-foreground" aria-hidden>
        <Smartphone className="h-10 w-10" />
        <ArrowLeftRight className="h-6 w-6 text-primary" />
        <Laptop className="h-12 w-12" />
      </div>
      <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s.t} className="panel p-5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-primary">0{i + 1}</span>
              <s.icon className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="mt-3 font-semibold">{s.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

const benefits = [
  { icon: ArrowLeftRight, t: "Works both directions", d: "Phone to laptop, laptop to phone, tablet to anything." },
  { icon: Zap, t: "Fast", d: "Under ten seconds from paste to received." },
  { icon: Trash2, t: "Auto-delete", d: "Gone after one read or a few minutes." },
  { icon: MonitorSmartphone, t: "No install", d: "Just a browser on each device." },
  { icon: Wallet, t: "Free", d: "No paid tier, no paywall." },
  { icon: UserX, t: "No account", d: "No sign-up, no email, no tracking profile." },
  { icon: Globe, t: "Across networks", d: "Mobile data and Wi‑Fi work together." },
  { icon: Timer, t: "Short-lived codes", d: "10 minutes for text, 15 for files." },
];

export function Benefits() {
  return (
    <section aria-labelledby="benefits" className="mx-auto max-w-6xl px-4 pt-24">
      <h2 id="benefits" className="text-center text-2xl font-bold sm:text-3xl">Why DropCode</h2>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((b) => (
          <div key={b.t} className="panel p-5 transition hover:border-primary/40">
            <b.icon className="h-5 w-5 text-primary" aria-hidden />
            <h3 className="mt-3 font-semibold">{b.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{b.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const cmpCols = ["DropCode", "Email yourself", "QR tools", "Messaging apps"];
const cmpRows: [string, boolean[]][] = [
  ["No account", [true, false, true, false]],
  ["Under 10 seconds", [true, false, true, false]],
  ["Auto-deletes", [true, false, false, false]],
  ["Typeable code", [true, false, false, false]],
  ["QR receive", [true, false, true, false]],
];

export function Comparison() {
  return (
    <section aria-labelledby="compare" className="mx-auto max-w-4xl px-4 pt-24">
      <h2 id="compare" className="text-center text-2xl font-bold sm:text-3xl">How it compares</h2>
      <div className="panel mt-10 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="p-4 text-left font-medium text-muted-foreground"><span className="sr-only">Feature</span></th>
              {cmpCols.map((c, i) => (
                <th key={c} scope="col" className={`p-4 text-center font-semibold ${i === 0 ? "text-primary" : ""}`}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cmpRows.map(([label, vals]) => (
              <tr key={label} className="border-b border-border last:border-0">
                <th scope="row" className="p-4 text-left font-normal">{label}</th>
                {vals.map((v, i) => (
                  <td key={i} className="p-4 text-center">
                    {v ? <Check className="mx-auto h-4 w-4 text-primary" aria-label="Yes" /> : <Minus className="mx-auto h-4 w-4 text-muted-foreground" aria-label="No" />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const uses = [
  { t: "Developers", d: "Move a snippet, command or URL from your laptop to a test phone." },
  { t: "Students", d: "Get lecture notes from a library computer onto your own device." },
  { t: "Work ↔ personal", d: "Pass a link between devices without mixing accounts." },
  { t: "New device setup", d: "Carry over a Wi‑Fi name, address or long link in seconds." },
  { t: "Screenshots", d: "Send a screenshot from your phone straight to your desktop." },
];

export function UseCases() {
  return (
    <section aria-labelledby="uses" className="mx-auto max-w-6xl px-4 pt-24">
      <h2 id="uses" className="text-center text-2xl font-bold sm:text-3xl">Made for quick handoffs</h2>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {uses.map((u) => (
          <li key={u.t} className="panel p-5">
            <h3 className="font-semibold">{u.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{u.d}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function FaqList({ limit }: { limit?: number }) {
  const items = limit ? FAQ.slice(0, limit) : FAQ;
  return (
    <div className="space-y-3">
      {items.map((f) => (
        <details key={f.q} className="panel group p-5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
            {f.q}
            <ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180" aria-hidden />
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function FaqSection() {
  return (
    <section aria-labelledby="faq" className="mx-auto max-w-3xl px-4 pt-24">
      <h2 id="faq" className="mb-10 text-center text-2xl font-bold sm:text-3xl">Questions</h2>
      <FaqList />
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="mx-auto max-w-3xl px-4 pt-24 text-center">
      <div className="panel bg-hero p-10">
        <h2 className="text-2xl font-bold sm:text-3xl">Got something to move?</h2>
        <p className="mt-2 text-muted-foreground">It takes about five seconds.</p>
        <button
          onClick={() => document.getElementById("tool")?.scrollIntoView({ behavior: "smooth", block: "center" })}
          className="mt-6 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-glow hover:brightness-110"
        >
          Send something now
        </button>
      </div>
    </section>
  );
}
