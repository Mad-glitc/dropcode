import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/SiteChrome";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => seo({ title: "Terms of Use — DropCode", description: "The simple rules for using DropCode's free text and file transfer tool.", path: "/terms" }),
  component: () => (
    <PageShell title="Terms of Use" intro="Last updated October 2026.">
      <div className="prose-drop">
        <h2>Using DropCode</h2>
        <p>DropCode is provided free, as-is, for moving your own content between devices. By using it you agree to these terms.</p>
        <h2>Acceptable use</h2>
        <ul>
          <li>Don't send illegal content, malware, or material you don't have the right to share.</li>
          <li>Don't attempt to guess codes, bypass rate limits or disrupt the service.</li>
        </ul>
        <h2>No guarantees</h2>
        <p>Content may be lost if a code expires or is used by someone else. Don't rely on DropCode as storage or for sensitive information.</p>
        <h2>Changes</h2>
        <p>We may update these terms or the service at any time.</p>
      </div>
    </PageShell>
  ),
});
