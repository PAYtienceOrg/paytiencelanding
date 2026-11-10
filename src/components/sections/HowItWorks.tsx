"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { Stagger, StaggerItem } from "../motion/Stagger";

const icon = "h-9 w-9 text-accent";
const svgProps = {
  viewBox: "0 0 36 36",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const steps: { n: number; title: string; body: string; icon: ReactNode }[] = [
  {
    n: 1,
    title: "Pick a coin & amount",
    body: "Choose the crypto you want — for example, 5 ETH.",
    icon: (
      <svg {...svgProps} className={icon}>
        <circle cx="18" cy="18" r="12" />
        <path d="M18 8v20M13 14h7a3 3 0 0 1 0 6h-6a3 3 0 0 0 0 6h8" />
      </svg>
    ),
  },
  {
    n: 2,
    title: "Set your price & window",
    body: "Name your target — $2,400 — and how long to wait: 3 days.",
    icon: (
      <svg {...svgProps} className={icon}>
        <path d="M5 8v22h26" />
        <path d="M9 12l6 6 5-3 9 10" />
        <path d="M5 22h26" strokeDasharray="2 3" />
      </svg>
    ),
  },
  {
    n: 3,
    title: "Get it — or get it back",
    body: "If the price hits, the coin is yours. If not, your money returns.",
    icon: (
      <svg {...svgProps} className={icon}>
        <path d="M8 18a10 10 0 1 1 3 7" />
        <path d="M8 11v7h7" />
      </svg>
    ),
  },
];

// No. 01：三栏步骤；出现后顶部横线从左往右画出。
export function HowItWorks() {
  const reduce = useReducedMotion();
  return (
    <section aria-labelledby="how-it-works-title" className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em]">No. 01</p>
      <h2 id="how-it-works-title" className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
        How it works
      </h2>
      <div className="relative mt-6 pt-8">
        <motion.div
          aria-hidden
          className="absolute left-0 top-0 h-px w-full origin-left bg-ink"
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
        />
        <Stagger>
          <ol className="grid gap-10 md:grid-cols-3 md:gap-0">
            {steps.map((s) => (
              <li key={s.n} className="md:border-l md:border-rule md:px-8 md:first:border-l-0 md:first:pl-0">
                <StaggerItem>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-6xl font-bold text-accent">{s.n}</span>
                    {s.icon}
                  </div>
                  <h3 className="mt-4 font-serif text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed">{s.body}</p>
                </StaggerItem>
              </li>
            ))}
          </ol>
        </Stagger>
      </div>
    </section>
  );
}
