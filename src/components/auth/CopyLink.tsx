"use client";

import { useState } from "react";

export function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex gap-2">
      <input
        readOnly
        value={link}
        aria-label="Your invite link"
        onFocus={(e) => e.currentTarget.select()}
        className="min-w-0 flex-1 border border-ink/40 bg-white/60 px-3 py-2.5 text-sm"
      />
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            // 剪贴板不可用时，用户仍可以手动复制输入框里的链接
          }
        }}
        className="shrink-0 bg-accent px-4 py-2.5 text-sm font-semibold text-paper hover:bg-ink"
      >
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}
