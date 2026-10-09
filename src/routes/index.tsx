import { createFileRoute } from "@tanstack/react-router";
import { DropTool } from "@/components/drop/DropTool";
import { Benefits, Comparison, FaqSection, FinalCta, HowItWorks, TrustStrip, UseCases } from "@/components/site/Marketing";
import { AboutDeveloper } from "@/components/site/SiteChrome";
import { jsonLd, seo } from "@/lib/seo";
import { SITE_URL } from "@/lib/share-constants";

export const Route = createFileRoute("/")({
  head: () => ({
    ...seo({
      title: "DropCode — Send text & files between devices with a code",
      description: "Move text, links and small files between your phone and laptop with a 5-character one-time code. No account, no app, free.",
      path: "/",
    }),
    scripts: [
      jsonLd({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "DropCode",
        url: SITE_URL,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      }),
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main>
      <section className="bg-hero px-4 pt-14 sm:pt-20">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Move it to your other device <span className="text-primary">in one code.</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">Text, links and small files. One-time, auto-deleting, no sign-up.</p>
        </div>
        <DropTool />
        <TrustStrip />
      </section>
      <HowItWorks />
      <Benefits />
      <Comparison />
      <UseCases />
      <FaqSection />
      <FinalCta />
      <AboutDeveloper />
    </main>
  );
}
