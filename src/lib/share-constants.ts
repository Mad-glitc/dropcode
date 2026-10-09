export const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const CODE_LENGTH = 5;
export const MAX_TEXT = 10_000;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const TEXT_TTL_SECONDS = 10 * 60;
export const FILE_TTL_SECONDS = 15 * 60;
export const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp", "video/mp4", "video/webm"] as const;
export const ALLOWED_EXT = ".png,.jpg,.jpeg,.webp,.mp4,.webm";

export const SITE_URL: string =
  (import.meta.env["VITE_SITE_URL"] as string | undefined)?.replace(/\/$/, "") ??
  "https://project--e04bb2d3-2518-4860-a9c7-1bcd0ca24275.lovable.app";
export const SUPPORT_URL = "https://example.com/support-dropcode";

export type ShareError =
  | "invalid_code"
  | "expired"
  | "used"
  | "rate_limited"
  | "too_large"
  | "wrong_type"
  | "empty"
  | "server";

export const ERROR_MESSAGES: Record<ShareError, string> = {
  invalid_code: "That code doesn't exist. Check for typos and try again.",
  expired: "This code has expired. Ask the sender to create a new one.",
  used: "This code was already used. Each code works only once.",
  rate_limited: "Slow down a little — too many attempts. Try again in a few minutes.",
  too_large: "That file is over 10 MB. Try a smaller file.",
  wrong_type: "That file type isn't supported. Use PNG, JPEG, WebP, MP4 or WebM.",
  empty: "Nothing to send yet.",
  server: "Something went wrong on our side. Please try again.",
};

export function normalizeCode(raw: string) {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, CODE_LENGTH);
}
export function isValidCode(code: string) {
  return code.length === CODE_LENGTH && [...code].every((c) => CODE_ALPHABET.includes(c));
}
export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
