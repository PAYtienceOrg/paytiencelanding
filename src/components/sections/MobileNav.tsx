"use client";

import { useEffect, useState } from "react";

type Link = { href: string; label: string };

// 手机上的菜单：点按钮展开，点链接或按 Esc 收起。
export function MobileNav({ links }: { links: Link[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 items-center justify-center border border-ink"
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
          {open ? <path d="M4 4l12 12M16 4L4 16" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
        </svg>
      </button>
      {open && (
        <ul id="mobile-nav" className="absolute inset-x-0 top-full border-b border-ink bg-paper px-6 py-2">
          {links.map((l) => (
            <li key={l.href} className="border-b border-rule last:border-b-0">
              <a href={l.href} onClick={() => setOpen(false)} className="block py-3 font-serif text-lg font-bold">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
