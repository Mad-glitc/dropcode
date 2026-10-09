import { createFileRoute } from "@tanstack/react-router";
import { AboutDeveloper, PageShell } from "@/components/site/SiteChrome";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => seo({ title: "About DropCode", description: "DropCode is a tiny, single-purpose tool for moving things between your own devices — fast, free and without accounts.", path: "/about" }),
  component: () => (
    <PageShell title="About DropCode" intro="One job, done quickly.">
      <div className="prose-drop">
        <p>DropCode exists because moving a link from a phone to a laptop shouldn't require emailing yourself, logging into a chat app or installing anything.</p>
        <p>It's deliberately small: paste, get a code, enter it elsewhere. Content is deleted after one use or a few minutes, and there are no accounts to create or profiles to build.</p>
        <h2>Principles</h2>
        <ul>
          <li><strong>Single-purpose.</strong> No feeds, no folders, no history.</li>
          <li><strong>Privacy-first.</strong> We keep content only as long as needed and never log it.</li>
          <li><strong>Free.</strong> Gentle rate limits keep it running for everyone.</li>
        </ul>
      </div>
      <div className="-mx-4"><AboutDeveloper /></div>
    </PageShell>
  ),
});
