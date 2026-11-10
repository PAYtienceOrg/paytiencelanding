"use client";

import { motion, useReducedMotion } from "framer-motion";

type SplitHeadlineProps = {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  delay?: number;
};

// 标题按词逐个浮现。整句放在 aria-label 里，逐词的 span 对读屏隐藏。
export function SplitHeadline({ text, as: Tag = "h1", className, delay = 0 }: SplitHeadlineProps) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} aria-hidden="true">
          {reduce ? (
            <span className="inline-block">{word}</span>
          ) : (
            <motion.span
              className="inline-block"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut", delay: delay + i * 0.08 }}
            >
              {word}
            </motion.span>
          )}
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
