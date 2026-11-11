import { SectionHeading } from "./SectionHeading";

const notes = [
  {
    title: "You pay upfront",
    body: "The full order amount is set aside when you place your order and stays there until it fills or your deadline ends.",
  },
  {
    title: "Orders fill at your target",
    body: "If the price drops past your target, you still buy at the price you set — not lower.",
  },
  {
    title: "Missed targets are refunded",
    body: "If the deadline passes without a fill, the full amount returns to your original payment method.",
  },
  {
    title: "Prices keep moving",
    body: "After your order fills, the coin's value can rise or fall. Nothing on this page is investment advice.",
  },
];

// 下单前需要知道的几件事，写清楚规则和风险。
export function GoodToKnow() {
  return (
    <section id="good-to-know" aria-labelledby="good-to-know-title" className="scroll-mt-20 py-12">
      <div className="grid gap-8 md:grid-cols-[1fr_1.6fr] md:gap-12">
        <SectionHeading
          id="good-to-know-title"
          label="Good to know"
          title="The rules, in plain words."
          intro="Four things to understand before you set a price."
        />
        <dl className="grid gap-px border border-ink/30 bg-ink/20 sm:grid-cols-2">
          {notes.map((n, i) => (
            <div key={n.title} className="bg-paper p-5">
              <dt className="flex items-baseline gap-3 font-serif text-lg font-bold">
                <span className="text-sm text-accent tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                {n.title}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink/80">{n.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
