const steps = [
  { n: "1", title: "Choose your crypto", body: "Pick a coin and an amount." },
  { n: "2", title: "Set your price & deadline", body: "Choose your target and how long to wait." },
  { n: "3", title: "Get crypto or a refund", body: "We fill your order or return your money." },
];

// Three steps in a row with vertical dividers; stacked with horizontal dividers on phones. They really are sequential, so the numbers stay.
export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-title" className="scroll-mt-20 py-10">
      <h2 id="how-it-works-title" className="font-serif text-2xl font-semibold tracking-tight">
        How it works
      </h2>
      <ol className="mt-5 grid md:grid-cols-3">
        {steps.map((s) => (
          <li
            key={s.n}
            className="flex items-start gap-4 border-t border-rule py-4 first:border-t-0 md:border-l md:border-t-0 md:px-6 md:py-1 md:first:border-l-0 md:first:pl-0 md:last:pr-0"
          >
            <span className="font-serif text-4xl font-semibold leading-none text-accent tabular-nums">{s.n}</span>
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
