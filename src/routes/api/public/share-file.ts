import { createFileRoute } from "@tanstack/react-router";
import { FILE_TTL_SECONDS, MAX_FILE_BYTES } from "@/lib/share-constants";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export const Route = createFileRoute("/api/public/share-file")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const s = await import("@/lib/share.server");
        if (!(await s.allowCreate(s.clientKey(request)))) return json({ ok: false, error: "rate_limited" }, 429);

        const len = Number(request.headers.get("content-length") ?? 0);
        if (len > MAX_FILE_BYTES + 64 * 1024) return json({ ok: false, error: "too_large" }, 413);

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return json({ ok: false, error: "server" }, 400);
        }
        const file = form.get("file");
        if (!(file instanceof File) || file.size === 0) return json({ ok: false, error: "empty" }, 400);
        if (file.size > MAX_FILE_BYTES) return json({ ok: false, error: "too_large" }, 413);

        const bytes = new Uint8Array(await file.arrayBuffer());
        const mime = s.sniffMime(bytes.subarray(0, 16));
        if (!mime) return json({ ok: false, error: "wrong_type" }, 415);

        await s.purgeExpired();
        const path = `${crypto.randomUUID()}.${s.EXT[mime]}`;
        const up = await supabaseAdmin.storage.from(s.BUCKET).upload(path, bytes, { contentType: mime });
        if (up.error) return json({ ok: false, error: "server" }, 500);

        const name = (file.name || `file.${s.EXT[mime]}`).replace(/[^\w.\- ()]/g, "_").slice(0, 120);
        const { data: rows, error } = await supabaseAdmin.rpc("create_share", {
          _kind: "file",
          _content: null as unknown as string,
          _file_path: path,
          _file_name: name,
          _file_size: file.size,
          _mime_type: mime,
          _ttl_seconds: FILE_TTL_SECONDS,
        });
        const row = rows?.[0];
        if (error || !row) {
          await supabaseAdmin.storage.from(s.BUCKET).remove([path]);
          return json({ ok: false, error: "server" }, 500);
        }
        return json({ ok: true, code: row.code, expiresAt: row.expires_at });
      },
    },
  },
});
