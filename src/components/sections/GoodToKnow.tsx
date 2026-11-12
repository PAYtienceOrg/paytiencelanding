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

// What to know before placing an order: the rules and the risks, stated plainly.
export function GoodToKnow() {
  return (
    <section id="good-to-know" aria-labelledby="good-to-know-title" className="scroll-mt-20 py-12">
      <div className="grid gap-8 md:grid-cols-[1fr_1.6fr] md:gap-12">
        <SectionHeading
          id="good-to-know-title"
          title="The rules, in plain words."
          intro="Four things to understand before you set a price."
        />
        {/* Compact list: rule name on the left, a one-sentence explanation on the right */}
        <dl className="border-b border-rule">
          {notes.map((n) => (
            <div key={n.title} className="grid gap-1 border-t border-rule py-4 sm:grid-cols-[15rem_1fr] sm:gap-6">
              <dt className="font-serif text-lg font-semibold">
                {n.title}
              </dt>
              <dd className="text-sm leading-relaxed text-ink/80 sm:pt-1">{n.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
