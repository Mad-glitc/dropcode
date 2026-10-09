import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertCircle, Copy, Download, FileUp, Inbox, Loader2, Send, Type, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { createTextShare, receiveShare, type ReceiveResult } from "@/lib/share.functions";
import {
  ALLOWED_EXT,
  ALLOWED_MIME,
  ERROR_MESSAGES,
  MAX_FILE_BYTES,
  MAX_TEXT,
  formatBytes,
  isValidCode,
  normalizeCode,
  type ShareError,
} from "@/lib/share-constants";
import { copyText } from "@/lib/clipboard";
import { CodeResult } from "./CodeResult";
import { CodeInput } from "./CodeInput";

type Tab = "text" | "file" | "receive";
const TABS: { id: Tab; label: string; icon: typeof Type }[] = [
  { id: "text", label: "Send Text", icon: Type },
  { id: "file", label: "Send File", icon: FileUp },
  { id: "receive", label: "Receive", icon: Inbox },
];

export function DropTool({ initialTab = "text", initialCode }: { initialTab?: Tab; initialCode?: string | undefined }) {
  const [tab, setTab] = useState<Tab>(initialCode ? "receive" : initialTab);
  return (
    <section id="tool" aria-label="DropCode tool" className="panel mx-auto w-full max-w-xl p-4 shadow-2xl sm:p-6">
      <div role="tablist" aria-label="Choose action" className="relative mb-6 grid grid-cols-3 rounded-xl bg-background p-1">
        <span
          aria-hidden
          className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-lg bg-secondary transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${TABS.findIndex((t) => t.id === tab) * 100}%)` }}
        />
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`relative z-10 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition-colors ${tab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <t.icon className="h-4 w-4" aria-hidden /> <span>{t.label}</span>
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} key={tab} className="animate-fade-up">
        {tab === "text" && <SendText />}
        {tab === "file" && <SendFile />}
        {tab === "receive" && <Receive initialCode={initialCode} />}
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Not end-to-end encrypted — don't share passwords or highly sensitive secrets.
      </p>
    </section>
  );
}

function ErrorNote({ error }: { error: ShareError | null }) {
  return (
    <div aria-live="assertive" className="min-h-0">
      {error && (
        <p className="animate-fade-up mt-3 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {ERROR_MESSAGES[error]}
        </p>
      )}
    </div>
  );
}

const primaryBtn =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-base font-semibold text-primary-foreground transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50";

function SendText() {
  const create = useServerFn(createTextShare);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ShareError | null>(null);
  const [result, setResult] = useState<{ code: string; expiresAt: string } | null>(null);

  async function submit() {
    if (!text.trim() || busy) return setError(text.trim() ? null : "empty");
    setBusy(true);
    setError(null);
    try {
      const r = await create({ data: { text } });
      if (r.ok) setResult({ code: r.code, expiresAt: r.expiresAt });
      else setError(r.error);
    } catch {
      setError("server");
    } finally {
      setBusy(false);
    }
  }

  if (result)
    return <CodeResult kindLabel="text" {...result} onReset={() => { setResult(null); setText(""); }} />;

  return (
    <div>
      <label htmlFor="send-text" className="sr-only">Text or link to send</label>
      <textarea
        id="send-text"
        value={text}
        maxLength={MAX_TEXT}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Paste text or a link…"
        rows={6}
        className="w-full resize-y rounded-xl border border-input bg-background p-4 text-base leading-relaxed placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />
      <div className="mb-4 mt-1.5 flex justify-between text-xs text-muted-foreground">
        <span className="hidden sm:inline">Ctrl/⌘ + Enter to generate</span>
        <span className={`ml-auto font-mono ${text.length >= MAX_TEXT ? "text-warning" : ""}`}>
          {text.length.toLocaleString()} / {MAX_TEXT.toLocaleString()}
        </span>
      </div>
      <button onClick={submit} disabled={busy || !text.trim()} className={primaryBtn}>
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />} Generate code
      </button>
      <ErrorNote error={error} />
    </div>
  );
}

function SendFile() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<ShareError | null>(null);
  const [result, setResult] = useState<{ code: string; expiresAt: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function pick(f: File | undefined) {
    setError(null);
    if (!f) return;
    if (f.size > MAX_FILE_BYTES) return setError("too_large");
    if (!(ALLOWED_MIME as readonly string[]).includes(f.type)) return setError("wrong_type");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function upload() {
    if (!file) return;
    setError(null);
    setProgress(0);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/public/share-file");
    xhr.upload.onprogress = (e) => e.lengthComputable && setProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      setProgress(null);
      try {
        const r = JSON.parse(xhr.responseText);
        if (r.ok) setResult({ code: r.code, expiresAt: r.expiresAt });
        else setError(r.error ?? "server");
      } catch {
        setError(xhr.status === 413 ? "too_large" : "server");
      }
    };
    xhr.onerror = () => { setProgress(null); setError("server"); };
    const fd = new FormData();
    fd.append("file", file);
    xhr.send(fd);
  }

  function clear() {
    setFile(null);
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  if (result) return <CodeResult kindLabel="file" {...result} onReset={() => { setResult(null); clear(); }} />;

  return (
    <div>
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
          className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-12 text-center transition ${drag ? "border-primary bg-primary/5" : "border-input bg-background"}`}
        >
          <Upload className={`h-8 w-8 ${drag ? "text-primary" : "text-muted-foreground"}`} aria-hidden />
          <p className="font-medium">Drop a file here</p>
          <button onClick={() => inputRef.current?.click()} className="rounded-full border border-border bg-secondary px-4 py-1.5 text-sm hover:border-primary/50">
            Browse files
          </button>
          <p className="text-xs text-muted-foreground">PNG, JPEG, WebP, MP4, WebM · max 10 MB</p>
        </div>
      ) : (
        <div className="rounded-xl border border-input bg-background p-3">
          <div className="relative overflow-hidden rounded-lg bg-surface-2">
            {file.type.startsWith("image/") ? (
              <img src={preview!} alt="Selected file preview" className="mx-auto max-h-56 object-contain" />
            ) : (
              <video src={preview!} className="mx-auto max-h-56" controls muted />
            )}
            <button onClick={clear} aria-label="Remove file" disabled={progress !== null} className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 hover:bg-background">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex justify-between gap-2 text-sm">
            <span className="truncate">{file.name}</span>
            <span className="shrink-0 font-mono text-muted-foreground">{formatBytes(file.size)}</span>
          </div>
          {progress !== null && (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      )}
      <input ref={inputRef} type="file" accept={ALLOWED_EXT} className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      <button onClick={upload} disabled={!file || progress !== null} className={`${primaryBtn} mt-4`}>
        {progress !== null ? <><Loader2 className="h-5 w-5 animate-spin" /> Uploading {progress}%</> : <><Send className="h-5 w-5" /> Generate code</>}
      </button>
      <ErrorNote error={error} />
    </div>
  );
}

function Receive({ initialCode }: { initialCode?: string | undefined }) {
  const receive = useServerFn(receiveShare);
  const [code, setCode] = useState(normalizeCode(initialCode ?? ""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ShareError | null>(null);
  const [result, setResult] = useState<Extract<ReceiveResult, { ok: true }> | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const auto = useRef(false);

  async function go(c = code) {
    const v = normalizeCode(c);
    if (!isValidCode(v)) return setError("invalid_code");
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const r = await receive({ data: { code: v } });
      if (!r.ok) return setError(r.error);
      setResult(r);
      if (r.kind === "text") {
        const ok = await copyText(r.content);
        ok ? toast.success("Copied to clipboard") : toast("Tap Copy to copy the text");
      }
    } catch {
      setError("server");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (initialCode && !auto.current && isValidCode(normalizeCode(initialCode))) {
      auto.current = true;
      go(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  async function download() {
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/download?code=${encodeURIComponent(code)}`, { method: "POST" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        return setError((j.error as ShareError) ?? "server");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result && result.kind === "file" ? result.fileName : "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setDownloaded(true);
      toast.success("Downloaded — the file is now deleted from DropCode");
    } catch {
      setError("server");
    } finally {
      setDownloading(false);
    }
  }

  function reset() {
    setResult(null);
    setCode("");
    setError(null);
    setDownloaded(false);
  }

  if (result?.kind === "text")
    return (
      <div className="animate-fade-up" aria-live="polite">
        <div className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-input bg-background p-4 text-base">
          {result.content}
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={async () => ((await copyText(result.content)) ? toast.success("Copied") : toast.error("Select the text to copy"))} className={primaryBtn}>
            <Copy className="h-5 w-5" /> Copy
          </button>
          <button onClick={reset} className="rounded-xl border border-border px-5 text-sm hover:bg-secondary">New</button>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">This content has been deleted from our server.</p>
      </div>
    );

  if (result?.kind === "file")
    return (
      <div className="animate-fade-up" aria-live="polite">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-xl border border-input bg-background p-4 text-sm">
          <dt className="text-muted-foreground">Name</dt><dd className="truncate">{result.fileName}</dd>
          <dt className="text-muted-foreground">Size</dt><dd className="font-mono">{formatBytes(result.fileSize)}</dd>
          <dt className="text-muted-foreground">Type</dt><dd className="font-mono">{result.mimeType}</dd>
        </dl>
        {!downloaded ? (
          <button onClick={download} disabled={downloading} className={`${primaryBtn} mt-4`}>
            {downloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />} Download
          </button>
        ) : (
          <button onClick={reset} className="mt-4 w-full rounded-xl border border-border py-3 text-sm hover:bg-secondary">Receive another</button>
        )}
        <p className="mt-3 text-center text-xs text-muted-foreground">Single download — the file is deleted right after.</p>
        <ErrorNote error={error} />
      </div>
    );

  return (
    <div>
      <p className="mb-4 text-center text-sm text-muted-foreground">Enter the 5-character code from the other device</p>
      <CodeInput value={code} onChange={(v) => { setCode(v); setError(null); }} onComplete={(v) => go(v)} />
      <button onClick={() => go()} disabled={busy || code.length !== 5} className={`${primaryBtn} mt-6`}>
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Inbox className="h-5 w-5" />} Receive
      </button>
      <ErrorNote error={error} />
    </div>
  );
}
