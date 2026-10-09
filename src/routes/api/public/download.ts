import { createFileRoute } from "@tanstack/react-router";
import { ERROR_MESSAGES, isValidCode, normalizeCode } from "@/lib/share-constants";

const fail = (key: keyof typeof ERROR_MESSAGES, status: number) =>
  new Response(JSON.stringify({ ok: false, error: key, message: ERROR_MESSAGES[key] }), {
    status,
    headers: { "content-type": "application/json" },
  });

export const Route = createFileRoute("/api/public/download")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const s = await import("@/lib/share.server");
        if (!(await s.allowLookup(s.clientKey(request)))) return fail("rate_limited", 429);

        const url = new URL(request.url);
        const code = normalizeCode(url.searchParams.get("code") ?? "");
        if (!isValidCode(code)) return fail("invalid_code", 400);

        // Atomic single-use consume
        const { data } = await supabaseAdmin.rpc("consume_share", { _code: code });
        const r = data?.[0];
        if (!r) return fail("server", 500);
        if (r.status !== "ok") {
          return fail(r.status === "expired" ? "expired" : r.status === "used" ? "used" : "invalid_code", 410);
        }
        if (r.kind !== "file" || !r.file_path) return fail("invalid_code", 400);

        const dl = await supabaseAdmin.storage.from(s.BUCKET).download(r.file_path);
        // Delete the stored file immediately — it's in memory now
        await supabaseAdmin.storage.from(s.BUCKET).remove([r.file_path]);
        if (dl.error || !dl.data) return fail("server", 500);

        const safe = (r.file_name || "download").replace(/["\r\n]/g, "_");
        return new Response(dl.data, {
          headers: {
            "content-type": r.mime_type || "application/octet-stream",
            "content-disposition": `attachment; filename="${safe}"; filename*=UTF-8''${encodeURIComponent(safe)}`,
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});
