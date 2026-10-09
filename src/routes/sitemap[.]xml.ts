import { createFileRoute } from "@tanstack/react-router";
import { POSTS } from "@/content/posts";

const PATHS = ["/", "/how-it-works", "/faq", "/about", "/contact", "/privacy", "/terms", "/blog", "/online-text-sharing", "/share-files-online"];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const siteUrl = import.meta.env["VITE_SITE_URL"]?.replace(/\/$/, "") || new URL(request.url).origin;
        const urls = [...PATHS, ...POSTS.map((p) => `/blog/${p.slug}`)]
          .map((p) => `<url><loc>${siteUrl}${p}</loc></url>`)
          .join("");
        return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
          headers: { "content-type": "application/xml" },
        });
      },
    },
  },
});
