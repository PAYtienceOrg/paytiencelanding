const steps = [
  { n: "1", title: "Choose your assets", body: "Pick an asset." },
  { n: "2", title: "Set a deadline", body: "Pick the date your order is settled." },
  { n: "3", title: "Set a target price", body: "The price you want to buy low or sell high at." },
  { n: "4", title: "Execute and get paid", body: "Your upfront yield is paid when you place the order." },
  { n: "5", title: "Get the asset or your money back", body: "Wait until the deadline: your order fills or you get your money back. You keep your upfront yield." },
];

// Five steps in a row with vertical dividers on wide screens; stacked with horizontal dividers below that.
// They really are sequential, so the numbers stay.
export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-title" className="scroll-mt-20 py-10">
      <h2 id="how-it-works-title" className="font-serif text-2xl font-semibold tracking-tight">
        How it works
      </h2>
      <ol className="mt-5 grid lg:grid-cols-5">
        {steps.map((s) => (
          <li
            key={s.n}
            className="flex items-start gap-4 border-t border-rule py-4 first:border-t-0 lg:flex-col lg:gap-2 lg:border-l lg:border-t-0 lg:px-5 lg:py-1 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0"
          >
            <span className="w-6 shrink-0 font-serif text-4xl font-semibold leading-none text-accent tabular-nums">{s.n}</span>
            <div>
              <h3 className="font-serif text-lg font-semibold leading-snug">{s.title}</h3>
              <p className="mt-1 text-sm text-ink/80">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
