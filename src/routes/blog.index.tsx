import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/SiteChrome";
import { POSTS } from "@/content/posts";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/blog/")({
  head: () => seo({ title: "DropCode Blog — tips for moving things between devices", description: "Short reads on sharing text and files across devices, how one-time codes work and troubleshooting.", path: "/blog" }),
  component: () => (
    <PageShell title="Blog">
      <ul className="space-y-4">
        {POSTS.map((p) => (
          <li key={p.slug}>
            <Link to="/blog/$slug" params={{ slug: p.slug }} className="panel block p-6 transition hover:border-primary/40">
              <time className="font-mono text-xs text-muted-foreground" dateTime={p.date}>{p.date}</time>
              <h2 className="mt-1 text-xl font-semibold">{p.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  ),
});
