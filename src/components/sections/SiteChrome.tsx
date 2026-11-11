import Link from "next/link";
import { JoinLink } from "../waitlist/JoinLink";
import { MobileNav } from "./MobileNav";
import { eyebrow } from "./SectionHeading";

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
        <a href="#top" className="font-serif text-2xl font-bold tracking-tight">
          Paytience
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
          <Link href="/login" className="hidden min-h-11 items-center font-semibold underline-offset-4 hover:underline sm:inline-flex">
            Log in
          </Link>
          <JoinLink className="inline-flex min-h-11 items-center bg-accent px-4 text-sm font-semibold text-paper transition-colors hover:bg-ink">
            Join the waitlist
          </JoinLink>
          <MobileNav links={[...links, { href: "/login", label: "Log in" }]} />
        </nav>
      </div>
    </header>
  );
}

const accessSteps = [
  { n: "01", title: "Create an account", body: "Sign up and confirm your email to get your place in line." },
  { n: "02", title: "Move up the line", body: "Share your invite link. Each friend who joins lifts you five places." },
  { n: "03", title: "Get let in", body: "We open access in waves, in waitlist order, and email you when it's your turn." },
  { n: "04", title: "Set your first price", body: "Your account is switched on and you can place your first order." },
];

// 页面底部：说明候补名单是分批放人进来的，只有一个按钮。
export function EarlyAccess() {
  return (
    <section id="early-access" aria-labelledby="early-access-title" className="scroll-mt-16 bg-accent py-16 text-paper">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 md:grid-cols-[1fr_1.4fr] md:items-end md:gap-12">
          <div>
            <p className={`${eyebrow} text-paper/80`}>Early access</p>
            <h2 id="early-access-title" className="mt-2 font-serif text-3xl font-bold leading-tight sm:text-4xl">
              We&apos;re opening Paytience in waves.
            </h2>
          </div>
          <p className="text-base leading-relaxed text-paper/85">
            To handle every order with care, we let people in gradually from the waitlist. Your place in line decides when
            your account is switched on.
          </p>
        </div>

        <ol className="mt-10 grid gap-px border border-paper/30 bg-paper/30 sm:grid-cols-2 lg:grid-cols-4">
          {accessSteps.map((s) => (
            <li key={s.n} className="bg-accent p-5">
              <span className="font-serif text-3xl font-bold leading-none text-paper/60 tabular-nums">{s.n}</span>
              <p className="mt-3 font-serif text-lg font-bold">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-paper/80">{s.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <JoinLink className="bg-paper px-6 py-3 text-sm font-semibold text-accent transition-colors hover:bg-white">
            Join the waitlist
          </JoinLink>
          <Link href="/login" className="inline-flex min-h-11 items-center text-sm underline-offset-4 hover:underline">
            <span>
              Already on the list? <span className="font-semibold">Log in</span>
            </span>
          </Link>
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
          <p className="font-serif text-xl font-bold">Paytience</p>
          <p className="mt-2 text-sm text-ink/80">Name your price for crypto. Get it, or get your money back.</p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="underline-offset-4 hover:underline">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="mt-8 border-t border-rule pt-4 text-xs leading-relaxed text-ink/70">
        Paytience is in early access and opening gradually from the waitlist. Examples on this page are for illustration only and are not investment advice.
        Crypto prices are volatile and can move in either direction.
      </p>
      <ul className="mt-4 flex flex-wrap items-center gap-4 text-xs">
        <li>© 2026 Paytience</li>
        <li aria-hidden className="h-4 w-px bg-ink" />
        <li>
          <a href="/privacy" className="underline-offset-4 hover:underline">
            Privacy
          </a>
        </li>
        <li aria-hidden className="h-4 w-px bg-ink" />
        <li>
          <a href="/terms" className="underline-offset-4 hover:underline">
            Terms
          </a>
        </li>
      </ul>
    </footer>
  );
}
