import { createFileRoute } from "@tanstack/react-router";
import { DropTool } from "@/components/drop/DropTool";

export const Route = createFileRoute("/r/$code")({
  head: () => ({
    meta: [
      { title: "Receive with DropCode" },
      { name: "description", content: "Receive text or a file sent to you with a DropCode one-time code." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Receive with DropCode" },
      { property: "og:description", content: "Someone sent you something with a one-time code." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReceivePage,
});

function ReceivePage() {
  const { code } = Route.useParams();
  return (
    <main className="bg-hero px-4 pt-14">
      <h1 className="mb-8 text-center text-3xl font-bold">Receive</h1>
      <DropTool initialCode={code} />
    </main>
  );
}
