import type { ReactNode } from "react";

// Small text such as form labels and summary headings: normal case, no all-caps with wide tracking
export const eyebrow = "text-sm font-semibold";

// Section heading: a large serif title plus an optional intro. No small label above the title.
export function SectionHeading({ id, title, intro }: { id: string; label?: string; title: string; intro?: ReactNode }) {
  return (
    <div className="max-w-2xl">
      <h2 id={id} className="font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
        {title}
      </h2>
      {intro && <p className="mt-3 text-base leading-relaxed text-ink/80">{intro}</p>}
    </div>
  );
}
