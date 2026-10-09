import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/SiteChrome";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => seo({ title: "Privacy Policy — DropCode", description: "What DropCode stores, for how long, and what it never does with your content.", path: "/privacy" }),
  component: () => (
    <PageShell title="Privacy Policy" intro="Last updated October 2026.">
      <div className="prose-drop">
        <h2>What we store</h2>
        <p>The text or file you send, its name, size and type, and when it expires. Nothing else is tied to it — no account, name or email.</p>
        <h2>How long</h2>
        <p>Content is deleted when it's received, or after 10 minutes (text) or 15 minutes (files) if nobody claims it. Expired items are cleaned up automatically.</p>
        <h2>Rate limiting</h2>
        <p>To prevent abuse we keep a one-way hash of your IP address with a request counter for a short time window. Counters are deleted within a day.</p>
        <h2>Security</h2>
        <p>Traffic is encrypted with HTTPS and files sit in private storage. Content is <strong>not</strong> end-to-end encrypted, so don't use DropCode for passwords or highly sensitive secrets.</p>
        <h2>We never</h2>
        <ul><li>Log or read the content you send.</li><li>Sell data or show ads inside the tool.</li><li>Use tracking cookies.</li></ul>
        <h2>Contact</h2>
        <p>Use the contact page for privacy questions.</p>
      </div>
    </PageShell>
  ),
});
