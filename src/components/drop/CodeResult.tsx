import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { copyText } from "@/lib/clipboard";

export function CodeResult({ code, expiresAt, onReset, kindLabel }: { code: string; expiresAt: string; onReset: () => void; kindLabel: string }) {
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const left = Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1000));
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const expired = left === 0;
  const link = `${origin}/r/${code}`;

  async function copy() {
    const ok = await copyText(code);
    if (ok) {
      setCopied(true);
      toast.success("Code copied");
      setTimeout(() => setCopied(false), 1600);
    } else toast.error("Couldn't copy — select the code manually");
  }

  return (
    <div className="animate-fade-up flex flex-col items-center gap-6 py-2 text-center" aria-live="polite">
      <p className="text-sm text-muted-foreground">Your {kindLabel} code — enter it on the other device</p>
      <div className="flex gap-2" aria-label={`Code ${code.split("").join(" ")}`}>
        {code.split("").map((ch, i) => (
          <span
            key={i}
            className="animate-reveal grid h-16 w-12 place-items-center rounded-xl border border-primary/40 bg-surface-2 font-mono text-3xl font-bold text-primary shadow-glow select-all sm:h-20 sm:w-16 sm:text-4xl"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            {ch}
          </span>
        ))}
      </div>
      <button
        onClick={copy}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm font-medium transition hover:border-primary/50"
      >
        {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy code"}
      </button>
      {origin && (
        <div className="rounded-2xl bg-foreground p-3">
          <QRCodeSVG value={link} size={148} bgColor="transparent" fgColor="currentColor" className="text-background" aria-label="QR code linking to the receive page" />
        </div>
      )}
      <p className={`font-mono text-sm ${expired ? "text-destructive" : "text-muted-foreground"}`}>
        {expired ? "Expired" : `Expires in ${mm}:${ss} · or after first use`}
      </p>
      <button onClick={onReset} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <RotateCcw className="h-3.5 w-3.5" /> Send something else
      </button>
    </div>
  );
}
