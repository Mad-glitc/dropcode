import { createHash } from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const BUCKET = "drops";

export function clientKey(request: Request) {
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  // Store only a hash of the IP
  return createHash("sha256").update(`dropcode:${ip}`).digest("hex").slice(0, 32);
}

export async function allow(key: string, bucket: "create" | "lookup", max: number, windowSeconds: number) {
  const { data, error } = await supabaseAdmin.rpc("hit_rate_limit", {
    _key: key,
    _bucket: bucket,
    _max: max,
    _window_seconds: windowSeconds,
  });
  if (error) {
    console.error("rate limit error", error.message);
    return true;
  }
  return data === true;
}
export const allowCreate = (key: string) => allow(key, "create", 20, 3600);
export const allowLookup = (key: string) => allow(key, "lookup", 30, 600);

/** Remove expired rows and their stored files. Safe to call often. */
export async function purgeExpired() {
  const { data, error } = await supabaseAdmin.rpc("purge_shares");
  if (error) return console.error("purge error", error.message);
  const paths = (data ?? []).map((r) => r.file_path).filter((p): p is string => !!p);
  if (paths.length) await supabaseAdmin.storage.from(BUCKET).remove(paths);
}

/** Detect real file type from magic bytes. */
export function sniffMime(b: Uint8Array): string | null {
  const at = (i: number, ...v: number[]) => v.every((x, j) => b[i + j] === x);
  if (at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (at(0, 0xff, 0xd8, 0xff)) return "image/jpeg";
  if (at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return "image/webp";
  if (at(4, 0x66, 0x74, 0x79, 0x70)) return "video/mp4";
  if (at(0, 0x1a, 0x45, 0xdf, 0xa3)) return "video/webm";
  return null;
}

export const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm",
};
