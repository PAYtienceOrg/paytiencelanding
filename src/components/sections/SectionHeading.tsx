import type { ReactNode } from "react";

// 表单字段名、小结标题等小号文字：普通大小写，不用全大写加宽字距
export const eyebrow = "text-sm font-semibold";

// 区块标题：衬线大标题 + 可选导语。不在标题上方再加小标签。
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
