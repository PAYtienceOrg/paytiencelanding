import { SectionHeading } from "./SectionHeading";

const faqs = [
  {
    q: "What happens if my target price isn't reached?",
    a: "You receive a full refund to your original payment method when your deadline ends.",
  },
  {
    q: "When does my order get filled?",
    a: "As soon as the market reaches your target price before your deadline. Your order fills at the price you set.",
  },
  {
    q: "What if the price drops below my target?",
    a: "Your order still fills at the price you set. Paytience doesn't wait for a lower price than the one you chose.",
  },
  {
    q: "Which cryptocurrencies can I choose?",
    a: "We're starting with ETH. People on the waitlist will hear first when more coins are added.",
  },
  {
    q: "How does the waitlist work?",
    a: "Create an account and confirm your email to get a place in line. We let people in gradually, in waitlist order. Log in any time to see your position — every friend who signs up with your invite link moves you up five places.",
  },
  {
    q: "When can I start using Paytience?",
    a: "We're opening in waves. When your place in line comes up, we switch on your account and email you — then you can place your first order.",
  },
];

// 常见问题：原生 details 展开收起，第一条默认展开。
export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 py-12">
      <div className="grid gap-8 md:grid-cols-[1fr_1.6fr] md:gap-12">
        <SectionHeading
          id="faq-title"
          label="Questions"
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
