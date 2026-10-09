import { createFileRoute } from "@tanstack/react-router";
import { DropTool } from "@/components/drop/DropTool";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/online-text-sharing")({
  head: () => seo({ title: "Online Text Sharing — share text with a one-time code", description: "Share text and links online between any two devices. Paste, get a 5-character code, and it auto-deletes after one read.", path: "/online-text-sharing" }),
  component: Page,
});

function Page() {
  return (
    <main className="bg-hero px-4 pt-14">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">Online text sharing, minus the clutter</h1>
        <p className="mt-4 text-lg text-muted-foreground">Paste a note, link or snippet up to 10,000 characters and pick it up on any device with a short code. It lands on your clipboard and vanishes from our server.</p>
      </div>
      <DropTool initialTab="text" />
      <div className="prose-drop mx-auto mt-16 max-w-2xl">
        <h2>Better than a pastebin for quick handoffs</h2>
        <p>Pastebins keep your text online at a guessable URL. DropCode text lives for ten minutes at most and can be read exactly once — perfect for a Wi‑Fi password for a guest device, a code snippet, or a long URL you don't want to retype.</p>
        <h2>Works anywhere</h2>
        <p>iPhone to Windows, Android to Mac, Chromebook to Linux — if it has a browser, it works. No pairing, no Bluetooth, no shared network.</p>
      </div>
    </main>
  );
}
