"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CountUp } from "../motion/CountUp";
import { Reveal } from "../motion/Reveal";

// 小线图：进入视口时把线画出来。
function Sparkline({ d }: { d: string }) {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 120 40" className="h-10 w-28 text-accent" fill="none" aria-hidden>
      <motion.path
        d={d}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </svg>
  );
}

// No. 02：两种结果并排对比。
export function TwoOutcomes() {
  return (
    <section aria-labelledby="two-outcomes-title" className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em]">No. 02</p>
      <h2 id="two-outcomes-title" className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
        Two outcomes
      </h2>
      <div className="mt-6 grid gap-10 border-t border-ink pt-8 md:grid-cols-2 md:gap-0">
        <Reveal className="md:pr-10">
          <Sparkline d="M2 8 L25 12 L45 10 L70 22 L95 28 L118 34" />
          <h3 className="mt-4 font-serif text-2xl font-bold">Price dips to $2,400</h3>
          <p className="mt-2 text-sm">Your target is reached within the window.</p>
          <p className="mt-4 font-serif text-3xl font-bold text-accent">You get 5 ETH at $2,400</p>
        </Reveal>
        <Reveal delay={0.15} className="md:border-l md:border-rule md:pl-10">
          <Sparkline d="M2 14 L30 12 L60 15 L90 12 L118 13" />
          <h3 className="mt-4 font-serif text-2xl font-bold">Price stays above</h3>
          <p className="mt-2 text-sm">The window closes without reaching your target.</p>
          <p className="mt-4 font-serif text-3xl font-bold text-accent">
            <CountUp value={12000} prefix="$" /> back to you, in full
          </p>
        </Reveal>
      </div>
      <p className="mt-8 text-xs opacity-70">
        Example for illustration: 5 ETH, $2,400 target, 3-day window. Crypto prices can move in either direction.
      </p>
    </section>
  );
}
