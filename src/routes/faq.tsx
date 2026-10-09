import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/SiteChrome";
import { FaqList } from "@/components/site/Marketing";
import { FAQ } from "@/content/faq";
import { jsonLd, seo } from "@/lib/seo";

export const Route = createFileRoute("/faq")({
  head: () => ({
    ...seo({ title: "DropCode FAQ — limits, privacy and expiry", description: "Answers about DropCode: how long codes last, file limits, privacy, encryption and why a code might not work.", path: "/faq" }),
    scripts: [
      jsonLd({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }),
    ],
  }),
  component: () => (
    <PageShell title="Frequently asked questions">
      <FaqList />
    </PageShell>
  ),
});
