import type { ReactNode } from "react";

export const eyebrow = "text-[11px] font-semibold uppercase tracking-[0.2em]";

// 区块标题：小号标签 + 衬线大标题 + 可选导语，所有区块统一用这一套。
export function SectionHeading({ id, label, title, intro }: { id: string; label: string; title: string; intro?: ReactNode }) {
  return (
    <div className="max-w-2xl">
      <p className={`${eyebrow} text-accent`}>{label}</p>
      <h2 id={id} className="mt-2 font-serif text-3xl font-bold leading-tight sm:text-4xl">
        {title}
      </h2>
      {intro && <p className="mt-3 text-base leading-relaxed text-ink/80">{intro}</p>}
    </div>
  );
}
