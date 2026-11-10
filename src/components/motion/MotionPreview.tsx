import { CountUp } from "./CountUp";
import { Reveal } from "./Reveal";
import { SplitHeadline } from "./SplitHeadline";
import { Stagger, StaggerItem } from "./Stagger";

const steps = [
  ["01", "Choose your crypto", "Pick a coin and an amount."],
  ["02", "Set your price & deadline", "Choose your target and how long to wait."],
  ["03", "Get crypto or a refund", "We fill your order or return your money."],
];

const filler = "Choose your crypto, set a lower price and a deadline. If the market reaches your target, we buy for you. If it doesn't, you get a full refund.";

// 预览页：四个动画组件的演示，页面够长可以滚动。
export function MotionPreview() {
  return (
    <main className="mx-auto max-w-4xl bg-paper px-6 py-16 text-ink">
      <section className="min-h-[80vh] border-b border-rule pb-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em]">SplitHeadline</p>
        <SplitHeadline
          text="Name your price. Get it — or get refunded."
          className="mt-6 font-serif text-5xl font-bold leading-tight sm:text-7xl"
        />
        <p className="mt-8 text-sm opacity-70">Scroll down ↓</p>
      </section>

      <section className="min-h-[70vh] border-b border-rule py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em]">CountUp</p>
        <Reveal>
          <p className="mt-6 font-serif text-lg">Full refund</p>
          <CountUp value={12000} prefix="$" className="font-serif text-6xl font-bold text-accent" />
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-10 text-lg">
            <CountUp value={1284} className="font-semibold" /> people have joined
          </p>
        </Reveal>
      </section>

      <section className="min-h-[70vh] border-b border-rule py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em]">Reveal</p>
        <div className="mt-6 space-y-10">
          {[0, 1, 2].map((i) => (
            <Reveal key={i} delay={i * 0.1}>
              <h2 className="font-serif text-3xl font-bold">Two outcomes. Zero guesswork.</h2>
              <p className="mt-3 max-w-xl">{filler}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em]">Stagger</p>
        <Stagger className="mt-6 grid gap-8 sm:grid-cols-3">
          {steps.map(([n, title, body]) => (
            <StaggerItem key={n}>
              <p className="font-serif text-4xl font-bold text-accent">{n}</p>
              <h3 className="mt-2 font-serif text-xl font-bold">{title}</h3>
              <p className="mt-1 text-sm">{body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </main>
  );
}
