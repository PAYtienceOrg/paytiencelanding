"use client";

import { useState } from "react";

// Read-only invite link with a copy button. Styled for the dark green waitlist section.
export function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex gap-2">
      <input
        readOnly
        value={link}
        aria-label="Your invite link"
        onFocus={(e) => e.currentTarget.select()}
        className="min-h-11 min-w-0 flex-1 border border-paper/40 bg-paper px-3 text-sm text-ink"
      />
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            // If the clipboard is unavailable, the user can still copy the link from the input by hand
          }
        }}
        className="min-h-11 shrink-0 bg-paper px-4 text-sm font-semibold text-accent transition-colors hover:bg-white"
      >
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
