import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import Markdown from "react-markdown";
import { POSTS } from "@/content/posts";
import { jsonLd, seo } from "@/lib/seo";
import { SITE_URL } from "@/lib/share-constants";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = POSTS.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    const p = loaderData.post;
    return {
      ...seo({ title: `${p.title} — DropCode`, description: p.description, path: `/blog/${p.slug}`, type: "article" }),
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: p.title,
          description: p.description,
          datePublished: p.date,
          url: `${SITE_URL}/blog/${p.slug}`,
          author: { "@type": "Organization", name: "DropCode" },
        }),
      ],
    };
  },
  notFoundComponent: PostNotFound,
  errorComponent: PostNotFound,
  component: PostPage,
});

function PostNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 pt-16 text-center">
      <h1 className="text-3xl font-bold">Article not found</h1>
      <Link to="/blog" className="mt-4 inline-block text-primary">Back to blog</Link>
    </main>
  );
}

function PostPage() {
  const { post } = Route.useLoaderData();
  return (
    <main className="mx-auto max-w-3xl px-4 pt-16">
      <article>
        <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">← Blog</Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
        <time className="mt-2 block font-mono text-xs text-muted-foreground" dateTime={post.date}>{post.date}</time>
        <div className="prose-drop mt-8"><Markdown>{post.body}</Markdown></div>
      </article>
      <div className="panel mt-12 p-6 text-center">
        <p className="font-semibold">Try it now — no account needed.</p>
        <Link to="/" className="mt-3 inline-block rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground">Open DropCode</Link>
      </div>
    </main>
  );
}
