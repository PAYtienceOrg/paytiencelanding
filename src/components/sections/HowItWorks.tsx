import { Stagger, StaggerItem } from "../motion/Stagger";

const steps = [
  { n: "01", title: "Choose your crypto", body: "Pick a coin and an amount." },
  { n: "02", title: "Set your price & deadline", body: "Choose your target and how long to wait." },
  { n: "03", title: "Get crypto or a refund", body: "We fill your order or return your money." },
];

// 三个步骤横排，中间用竖线分隔；手机上竖排，用横线分隔。
export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-title" className="scroll-mt-20 py-8">
      <h2 id="how-it-works-title" className="text-[11px] font-semibold uppercase tracking-[0.2em]">
        How it works
      </h2>
      <Stagger>
        <ol className="mt-4 grid md:grid-cols-3">
          {steps.map((s) => (
            <li
              key={s.n}
              className="border-t border-rule py-4 first:border-t-0 md:border-l md:border-t-0 md:px-6 md:py-1 md:first:border-l-0 md:first:pl-0 md:last:pr-0"
            >
              <StaggerItem className="flex items-start gap-4">
                <span className="font-serif text-4xl font-bold leading-none text-accent tabular-nums">{s.n}</span>
                <div>
                  <h3 className="font-serif text-lg font-bold leading-snug">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed">{s.body}</p>
                </div>
              </StaggerItem>
            </li>
          ))}
        </ol>
      </Stagger>
    </section>
  );
}
