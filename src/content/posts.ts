export type Post = { slug: string; title: string; description: string; date: string; body: string };

export const POSTS: Post[] = [
  {
    slug: "stop-emailing-yourself",
    title: "Stop emailing yourself",
    description: "Emailing a link to yourself takes six steps and clutters your inbox. There's a faster way.",
    date: "2026-09-12",
    body: `Most of us have done it: you find a link on your phone and want it on your laptop, so you open your mail app, type your own address, paste, send, wait, open your inbox on the other device and dig it out.

## Why the habit sticks

Email is everywhere and it's already signed in. But it was never designed as a clipboard. Every self-sent note stays in your inbox forever, gets indexed, backed up, and sometimes lands in spam.

## The short-code approach

With **DropCode** you paste your text, get a 5-character code, and type it on the other device. That's it:

1. Paste the link or note.
2. Read the code off your screen (or scan the QR).
3. Enter it on the other device — the text is copied to your clipboard automatically.

The content is deleted the moment it's received, so there's nothing left behind.

## When email is still better

If you need a permanent record, or you're sending to someone who isn't next to you, email is fine. For moving something between *your own* devices right now, a one-time code wins.`,
  },
  {
    slug: "how-short-code-sharing-works",
    title: "How short-code sharing works",
    description: "A look under the hood: unambiguous codes, single-use reads and automatic expiry.",
    date: "2026-09-20",
    body: `A 5-character code sounds tiny, but it's enough for a short-lived, single-use handoff. Here's how DropCode makes it work.

## An alphabet without look-alikes

Codes use 31 characters: A–Z and 2–9, minus \`0\`, \`O\`, \`1\`, \`I\` and \`L\`. That avoids the classic "is that a zero or an O?" problem. With 31 characters and 5 positions there are about 28.6 million possible codes.

## Generated on the server

Codes are created server-side and checked for collisions before they're handed out, so two active shares never share a code.

## Single-use, atomically

When a receiver enters a code, the server locks that row, marks it as used and returns the content in one database transaction. If two people try at the same instant, only one wins.

## Short lives

Text expires after 10 minutes, files after 15. Expired items are cleaned up automatically and are treated as invalid even before cleanup runs.

## Guessing is throttled

Lookups are rate-limited per network, so guessing codes at random is impractical in the few minutes a code exists.`,
  },
  {
    slug: "why-a-code-didnt-work",
    title: "Why a code didn't work",
    description: "Invalid, expired or already used? What each message means and how to fix it.",
    date: "2026-09-28",
    body: `Entered a code and got an error? Here's what each message means.

## "That code doesn't exist"

Usually a typo. Remember codes never contain **0, O, 1, I or L** — if you think you see one of those, it's a different character. Scanning the QR code avoids typing entirely.

## "This code has expired"

Text codes last 10 minutes and file codes 15 minutes. Ask the sender to create a new one.

## "This code was already used"

Every code works once. If you opened it on another device or tab first, the content has already been delivered and deleted.

## "Slow down a little"

Too many attempts from your network in a short time. Wait a few minutes and try again.

## File errors when sending

- **Over 10 MB** — compress the image or trim the video.
- **Wrong type** — only PNG, JPEG, WebP, MP4 and WebM are accepted, and we check the actual file contents, not just the name.`,
  },
];
