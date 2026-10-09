import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PageShell } from "@/components/site/SiteChrome";
import { contactSchema, sendContact } from "@/lib/share.functions";
import { ERROR_MESSAGES } from "@/lib/share-constants";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => seo({ title: "Contact DropCode", description: "Questions, feedback or abuse reports — send the DropCode team a message.", path: "/contact" }),
  component: Contact,
});

const field = "w-full rounded-xl border border-input bg-background px-4 py-3 text-base focus:border-primary focus:outline-none";

function Contact() {
  const send = useServerFn(sendContact);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "busy" | "sent" | string>("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setStatus("busy");
    try {
      const r = await send({ data: parsed.data });
      setStatus(r.ok ? "sent" : ERROR_MESSAGES[r.error]);
    } catch {
      setStatus(ERROR_MESSAGES.server);
    }
  }

  if (status === "sent")
    return (
      <PageShell title="Thanks!">
        <p className="text-muted-foreground" aria-live="polite">Your message is on its way. We'll reply by email if needed.</p>
      </PageShell>
    );

  return (
    <PageShell title="Contact" intro="Feedback, questions or abuse reports.">
      <form onSubmit={submit} noValidate className="panel space-y-4 p-6">
        {(["name", "email"] as const).map((k) => (
          <div key={k}>
            <label htmlFor={k} className="mb-1.5 block text-sm font-medium capitalize">{k}</label>
            <input id={k} type={k === "email" ? "email" : "text"} maxLength={k === "email" ? 255 : 100} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} aria-invalid={!!errors[k]} aria-describedby={`${k}-err`} className={field} />
            <p id={`${k}-err`} className="mt-1 text-sm text-destructive">{errors[k]}</p>
          </div>
        ))}
        <div>
          <label htmlFor="message" className="mb-1.5 block text-sm font-medium">Message</label>
          <textarea id="message" rows={6} maxLength={2000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} aria-invalid={!!errors["message"]} aria-describedby="message-err" className={field} />
          <p id="message-err" className="mt-1 text-sm text-destructive">{errors["message"]}</p>
        </div>
        <button disabled={status === "busy"} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-50">
          {status === "busy" && <Loader2 className="h-4 w-4 animate-spin" />} Send message
        </button>
        {status !== "idle" && status !== "busy" && <p className="text-sm text-destructive" aria-live="assertive">{status}</p>}
      </form>
    </PageShell>
  );
}
