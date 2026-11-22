import { JoinLink } from "../waitlist/JoinLink";
import { WaitlistForm } from "../waitlist/WaitlistForm";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";

const links = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#simulator", label: "Try it" },
  { href: "#early-access", label: "Early access" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-ink bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-30 focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:text-paper"
      >
        Skip to content
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <a href="#top" aria-label="PAYtience home" className="flex items-center">
          <Logo />
        </a>
        <nav aria-label="Main" className="flex items-center gap-3 text-sm md:gap-6">
          <ul className="hidden items-center gap-6 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="underline-offset-4 hover:underline">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <span aria-hidden className="hidden h-5 w-px bg-ink md:block" />
          <JoinLink className="inline-flex min-h-11 items-center whitespace-nowrap bg-accent px-4 text-sm font-semibold text-paper transition-colors hover:bg-ink">
            {/* On very narrow phones only "Join" is visible so the header stays on one line; screen readers still get the full name. */}
            <span>
              Join<span className="max-[399px]:sr-only"> the waitlist</span>
            </span>
          </JoinLink>
          <MobileNav links={links} />
        </nav>
      </div>
    </header>
  );
}

const accessSteps = [
  { n: "01", title: "Join with your email", body: "Enter your email below to get your place in line. No account or password." },
  { n: "02", title: "Get let in", body: "We open access in waves, in waitlist order, and email you when it's your turn." },
  { n: "03", title: "Set your first price", body: "Once you're in, you can place your first order." },
];

// Bottom of the page: explains that the waitlist lets people in gradually, and holds the main sign-up form (the hero has a compact copy).
export function EarlyAccess() {
  return (
    <section id="early-access" aria-labelledby="early-access-title" className="scroll-mt-16 bg-accent py-16 text-paper">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 md:grid-cols-[1fr_1.4fr] md:items-end md:gap-12">
          <div>
            <h2 id="early-access-title" className="font-serif text-3xl font-bold leading-tight sm:text-4xl">
              We&apos;re opening PAYtience in waves.
            </h2>
          </div>
          <p className="text-base leading-relaxed text-paper/85">
            To handle every order with care, we let people in gradually from the waitlist. Your place in line decides when
            you get in.
          </p>
        </div>

        <ol className="mt-10 grid gap-px border border-paper/30 bg-paper/30 sm:grid-cols-3">
          {accessSteps.map((s) => (
            <li key={s.n} className="bg-accent p-5">
              <span className="font-serif text-3xl font-bold leading-none text-paper/60 tabular-nums">{s.n}</span>
              <p className="mt-3 font-serif text-lg font-bold">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-paper/80">{s.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10">
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="font-serif text-xl font-bold">PAYtience</p>
          <p className="mt-2 text-sm text-ink/80">Pick a price, set a date, get paid while you wait patiently.</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-4 whitespace-nowrap text-sm sm:gap-x-6">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="mt-8 border-t border-rule pt-4 text-xs leading-relaxed text-ink/70">
        PAYtience is in early access and opening gradually from the waitlist. Examples on this page are for illustration only and are not investment advice.
      </p>
      <p className="mt-4 text-xs">© 2026 PAYtience</p>
    </footer>
  );
}
