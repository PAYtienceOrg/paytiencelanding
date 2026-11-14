import { SectionHeading } from "./SectionHeading";

const faqs = [
  {
    q: "When does my order get filled?",
    a: "Only at your deadline. We check the market price once, at that moment. A buy-low order fills if the price is at or below your target; a sell-high order fills if it is at or above. Either way it fills at the price you set, and never earlier.",
  },
  {
    q: "What if the price touches my target before the deadline?",
    a: "Nothing happens yet. Only the price at the deadline counts, so if the price touches your target and then turns back by the deadline, your order doesn't fill and you get your money back.",
  },
  {
    q: "What happens if my order doesn't fill?",
    a: "You get back what you committed in full: your USDC for a buy-low order, your asset for a sell-high order. You keep the upfront yield.",
  },
  {
    q: "What is the upfront yield?",
    a: "It's paid to you when you place your order, and it's yours to keep whether the order fills or you get your money back.",
  },
  {
    q: "What if the price is far past my target at the deadline?",
    a: "Your order still fills at the price you set. That means buying above the market price for a buy-low order, or selling below it for a sell-high order. Choose a target you'd be happy with.",
  },
  {
    q: "Which assets can I choose?",
    a: "We're starting with ETH. Stocks and ETFs are on the way, with pre-stocks coming soon. People on the waitlist will hear first when more assets are added.",
  },
  {
    q: "How does the waitlist work?",
    a: "Enter your email to get a place in line — no account or password. We let people in gradually, in waitlist order. Enter the same email again any time to see your position.",
  },
  {
    q: "When can I start using PAYtience?",
    a: "We're opening in waves. When your place in line comes up, we email you — then you can place your first order.",
  },
];

// FAQ: native details elements; the first one is open by default.
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 py-12">
      <div className="grid gap-8 md:grid-cols-[1fr_1.6fr] md:gap-12">
        <SectionHeading
          id="faq-title"
          title="Frequently asked questions"
          intro="Short answers to what people ask most before setting a price."
        />
        <div className="border-t border-ink/40">
          {faqs.map((f, i) => (
            <details key={f.q} open={i === 0} className="faq group border-b border-ink/40">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-3 py-3 font-serif text-lg font-bold transition-colors hover:bg-mint/60 group-open:bg-mint">
                {f.q}
                <span aria-hidden className="text-xl font-normal leading-none">
                  <span className="group-open:hidden">+</span>
                  <span className="hidden group-open:inline">−</span>
                </span>
              </summary>
              <p className="px-3 pb-4 pt-1 text-sm leading-relaxed group-open:bg-mint">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
