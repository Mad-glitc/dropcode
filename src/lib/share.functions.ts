import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { MAX_TEXT, TEXT_TTL_SECONDS, type ShareError } from "./share-constants";

type Fail = { ok: false; error: ShareError };

export const createTextShare = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ text: z.string().min(1).max(MAX_TEXT) }).parse(d))
  .handler(async ({ data }): Promise<{ ok: true; code: string; expiresAt: string } | Fail> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const s = await import("./share.server");
    const key = s.clientKey(getRequest());
    if (!(await s.allowCreate(key))) return { ok: false, error: "rate_limited" };
    if (!data.text.trim()) return { ok: false, error: "empty" };
    await s.purgeExpired();
    const { data: rows, error } = await supabaseAdmin.rpc("create_share", {
      _kind: "text",
      _content: data.text,
      _file_path: null as unknown as string,
      _file_name: null as unknown as string,
      _file_size: null as unknown as number,
      _mime_type: null as unknown as string,
      _ttl_seconds: TEXT_TTL_SECONDS,
    });
    const row = rows?.[0];
    if (error || !row) return { ok: false, error: "server" };
    return { ok: true, code: row.code, expiresAt: row.expires_at };
  });

export type ReceiveResult =
  | { ok: true; kind: "text"; content: string }
  | { ok: true; kind: "file"; fileName: string; fileSize: number; mimeType: string; expiresAt: string }
  | Fail;

/** Text: consumed atomically and returned. File: metadata only (download consumes). */
export const receiveShare = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ code: z.string().regex(/^[A-Z0-9]{5}$/) }).parse(d))
  .handler(async ({ data }): Promise<ReceiveResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const s = await import("./share.server");
    if (!(await s.allowLookup(s.clientKey(getRequest())))) return { ok: false, error: "rate_limited" };

    const { data: peek } = await supabaseAdmin.rpc("peek_share", { _code: data.code });
    const p = peek?.[0];
    if (!p) return { ok: false, error: "server" };
    if (p.status !== "ok") return { ok: false, error: statusToError(p.status) };

    if (p.kind === "file") {
      return {
        ok: true,
        kind: "file",
        fileName: p.file_name,
        fileSize: p.file_size,
        mimeType: p.mime_type,
        expiresAt: p.expires_at,
      };
    }
    const { data: cons } = await supabaseAdmin.rpc("consume_share", { _code: data.code });
    const c = cons?.[0];
    if (!c) return { ok: false, error: "server" };
    if (c.status !== "ok") return { ok: false, error: statusToError(c.status) };
    return { ok: true, kind: "text", content: c.content ?? "" };
  });

function statusToError(st: string): ShareError {
  return st === "expired" ? "expired" : st === "used" ? "used" : "invalid_code";
}

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

export const sendContact = createServerFn({ method: "POST" })
  .inputValidator((d) => contactSchema.parse(d))
  .handler(async ({ data }): Promise<{ ok: true } | Fail> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const s = await import("./share.server");
    if (!(await s.allowCreate(s.clientKey(getRequest())))) return { ok: false, error: "rate_limited" };
    const { error } = await supabaseAdmin.from("messages").insert(data);
    if (error) return { ok: false, error: "server" };
    return { ok: true };
  });
