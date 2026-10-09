import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/SiteChrome";
import { HowItWorks } from "@/components/site/Marketing";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/how-it-works")({
  head: () => seo({ title: "How DropCode works — one-time codes explained", description: "Paste, get a 5-character code, enter it on another device. Learn how DropCode's single-use, auto-expiring codes work.", path: "/how-it-works" }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageShell title="How it works" intro="Four steps, about five seconds.">
        <div className="prose-drop">
          <h2>Sending</h2>
          <p>Open DropCode, paste text or pick a file, and press <strong>Generate code</strong>. You'll see a 5-character code, a QR code and a countdown.</p>
          <h2>Receiving</h2>
          <p>On the other device, open the <strong>Receive</strong> tab and type the code — or simply scan the QR with your camera. Text is copied to your clipboard automatically; files download with one tap.</p>
          <h2>What happens to your content</h2>
          <ul>
            <li>It's deleted the moment it's received — codes work exactly once.</li>
            <li>Unclaimed text expires after 10 minutes, files after 15.</li>
            <li>Codes avoid look-alike characters (0, O, 1, I, L).</li>
          </ul>
          <p>Curious about the details? Read <Link to="/blog/$slug" params={{ slug: "how-short-code-sharing-works" }}>how short-code sharing works</Link>.</p>
        </div>
      </PageShell>
      <HowItWorks />
    </>
  );
}
