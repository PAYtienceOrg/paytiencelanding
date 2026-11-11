import type { ReactNode } from "react";
import { CountUp } from "../motion/CountUp";
import { Reveal } from "../motion/Reveal";
import { SectionHeading } from "./SectionHeading";

const iconProps = {
  viewBox: "0 0 36 36",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  className: "h-10 w-10 text-accent",
} as const;

const CheckIcon = () => (
  <svg {...iconProps}>
    <circle cx="18" cy="18" r="14" />
    <path d="M11.5 18.5l4.5 4.5 8.5-9.5" />
  </svg>
);

const RefundIcon = () => (
  <svg {...iconProps}>
    <path d="M8 18a10 10 0 1 1 3 7" />
    <path d="M8 11v7h7" />
  </svg>
);

function Outcome({ icon, title, body, result, tinted }: { icon: ReactNode; title: string; body: string; result: ReactNode; tinted?: boolean }) {
  return (
    <div className={`flex h-full border border-ink/40 ${tinted ? "bg-mint" : "bg-white/40"}`}>
      <div className="flex shrink-0 items-center border-r border-ink/25 px-4 sm:px-6">{icon}</div>
      <div className="px-5 py-4">
        <h3 className="font-serif text-2xl font-bold">{title}</h3>
        <p className="mt-1 text-sm">{body}</p>
        <p className="mt-3 font-serif text-2xl font-bold text-accent">{result}</p>
      </div>
    </div>
  );
}

// 两种结果并排对比。
export function TwoOutcomes() {
  return (
    <section aria-labelledby="two-outcomes-title" className="py-12">
      <SectionHeading
        id="two-outcomes-title"
        label="Outcomes"
        title="Two outcomes. Zero guesswork."
        intro="Every order ends one of two ways — and you know both before you start."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-8">
        <Reveal>
          <Outcome
            tinted
            icon={<CheckIcon />}
            title="Price hits $2,400"
            body="Your target is reached within 3 days."
            result="You get 5 ETH at $2,400"
          />
        </Reveal>
        <Reveal delay={0.15}>
          <Outcome
            icon={<RefundIcon />}
            title="Price stays above"
            body="Your payment returns to its original source."
            result={
              <>
                Full <CountUp value={12000} prefix="$" /> refund
              </>
            }
          />
        </Reveal>
      </div>
      <p className="mt-4 text-xs opacity-70">
        Example for illustration: 5 ETH, $2,400 target, 3-day window. Crypto prices can move in either direction.
      </p>
    </section>
  );
}
