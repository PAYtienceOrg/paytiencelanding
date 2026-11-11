import type { ReactNode } from "react";
import { Stagger, StaggerItem } from "../motion/Stagger";
import { SectionHeading } from "./SectionHeading";

const icon = {
  viewBox: "0 0 32 32",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  className: "h-8 w-8 text-accent",
} as const;

const reasons: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: "No chart-watching",
    body: "Set your price once. You don't need to be online when the market moves.",
    icon: (
      <svg {...icon}>
        <circle cx="16" cy="16" r="12" />
        <path d="M16 9v7l5 3" />
      </svg>
    ),
  },
  {
    title: "Your price or your money",
    body: "If your target isn't reached by the deadline, the full amount goes back to your original payment method.",
    icon: (
      <svg {...icon}>
        <path d="M6 16a10 10 0 1 1 3 7" />
        <path d="M6 9v7h7" />
      </svg>
    ),
  },
  {
    title: "Numbers upfront",
    body: "Before you place an order you see exactly what you commit and what you get in each outcome.",
    icon: (
      <svg {...icon}>
        <rect x="7" y="5" width="18" height="22" />
        <path d="M11 11h10M11 16h10M11 21h6" />
      </svg>
    ),
  },
];

// 为什么要等价格：三点好处。
export function WhyWait() {
  return (
    <section aria-labelledby="why-wait-title" className="py-12">
      <SectionHeading
        id="why-wait-title"
        label="Why wait for your price"
        title="Buy at the price you decided on — calmly."
        intro="Most people already have a price in mind. Paytience turns that number into an order with a clear end date."
      />
      <Stagger className="mt-8 grid gap-8 md:grid-cols-3 md:gap-0">
        {reasons.map((r) => (
          <StaggerItem key={r.title} className="md:border-l md:border-rule md:px-6 md:first:border-l-0 md:first:pl-0 md:last:pr-0">
            {r.icon}
            <h3 className="mt-4 font-serif text-xl font-bold">{r.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/80">{r.body}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
