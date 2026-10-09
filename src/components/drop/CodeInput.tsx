import { useRef } from "react";
import { CODE_ALPHABET, CODE_LENGTH, normalizeCode } from "@/lib/share-constants";

export function CodeInput({ value, onChange, onComplete }: { value: string; onChange: (v: string) => void; onComplete?: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = Array.from({ length: CODE_LENGTH }, (_, i) => value[i] ?? "");

  function setAt(i: number, ch: string) {
    const arr = chars.slice();
    arr[i] = ch;
    const next = arr.join("").slice(0, CODE_LENGTH);
    onChange(next);
    return next;
  }

  function handleInput(i: number, raw: string) {
    const clean = normalizeCode(raw);
    if (clean.length > 1) return paste(i, clean);
    const ch = clean;
    if (ch && !CODE_ALPHABET.includes(ch)) return;
    const next = setAt(i, ch);
    if (ch && i < CODE_LENGTH - 1) refs.current[i + 1]?.focus();
    if (next.replace(/\s/g, "").length === CODE_LENGTH) onComplete?.(next);
  }

  function paste(i: number, text: string) {
    const clean = normalizeCode(text);
    const merged = (value.slice(0, i) + clean).slice(0, CODE_LENGTH);
    onChange(merged);
    refs.current[Math.min(merged.length, CODE_LENGTH - 1)]?.focus();
    if (merged.length === CODE_LENGTH) onComplete?.(merged);
  }

  return (
    <div className="flex justify-center gap-2" role="group" aria-label="Enter 5-character code">
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={c}
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="one-time-code"
          spellCheck={false}
          maxLength={CODE_LENGTH}
          aria-label={`Character ${i + 1}`}
          onChange={(e) => handleInput(i, e.target.value)}
          onPaste={(e) => {
            e.preventDefault();
            paste(i, e.clipboardData.getData("text"));
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !chars[i] && i > 0) {
              setAt(i - 1, "");
              refs.current[i - 1]?.focus();
            } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
            else if (e.key === "ArrowRight" && i < CODE_LENGTH - 1) refs.current[i + 1]?.focus();
            else if (e.key === "Enter" && value.length === CODE_LENGTH) onComplete?.(value);
          }}
          onFocus={(e) => e.target.select()}
          className="h-16 w-12 rounded-xl border border-input bg-surface-2 text-center font-mono text-3xl font-bold uppercase text-foreground transition focus:border-primary focus:shadow-glow focus:outline-none sm:h-20 sm:w-16 sm:text-4xl"
        />
      ))}
    </div>
  );
}
