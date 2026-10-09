import { createFileRoute } from "@tanstack/react-router";
import { DropTool } from "@/components/drop/DropTool";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/share-files-online")({
  head: () => seo({ title: "Share Files Online — send photos & videos with a code", description: "Send a photo, screenshot or short video up to 10 MB between devices with a one-time code. Private storage, single download, auto-delete.", path: "/share-files-online" }),
  component: Page,
});

function Page() {
  return (
    <main className="bg-hero px-4 pt-14">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">Share files online without the upload limbo</h1>
        <p className="mt-4 text-lg text-muted-foreground">Drop in a screenshot, photo or short clip, get a code, download it on the other device. One download, then it's gone.</p>
      </div>
      <DropTool initialTab="file" />
      <div className="prose-drop mx-auto mt-16 max-w-2xl">
        <h2>Made for screenshots and quick clips</h2>
        <p>Supports PNG, JPEG, WebP, MP4 and WebM up to 10 MB. We check each file's actual contents — not just its name — before accepting it.</p>
        <h2>Private by default</h2>
        <p>Files are stored privately, never get a public link, and are deleted the moment they're downloaded or after 15 minutes, whichever comes first.</p>
      </div>
    </main>
  );
}
