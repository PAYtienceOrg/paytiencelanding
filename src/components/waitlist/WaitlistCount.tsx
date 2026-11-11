"use client";

import { useEffect, useState } from "react";

export function PeopleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className={className}>
      <circle cx="7" cy="6" r="3" />
      <circle cx="14" cy="7" r="2.5" />
      <path d="M1 16c0-3 2.7-5 6-5s6 2 6 5v1H1z" />
      <path d="M14 11c2.8 0 5 1.6 5 4.2V16h-4.5c0-1.9-.7-3.5-2-4.6.5-.3 1-.4 1.5-.4z" />
    </svg>
  );
}

// 已报名人数。接口失败或还没人报名时不显示。
export function WaitlistCount() {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/waitlist/count")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { total?: number } | null) => {
        if (alive && typeof d?.total === "number") setTotal(d.total);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!total) return null;

  return (
    <p className="flex items-center gap-2 text-sm">
      <PeopleIcon className="h-4 w-4 text-accent" />
      <span>
        <span className="font-semibold tabular-nums">{total.toLocaleString("en-US")}</span>{" "}
        {total === 1 ? "person has" : "people have"} joined
      </span>
    </p>
  );
}
