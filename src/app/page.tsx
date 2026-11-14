import { Assets } from "@/components/sections/Assets";
import { Faq } from "@/components/sections/Faq";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { EarlyAccess, SiteFooter, SiteHeader } from "@/components/sections/SiteChrome";
import { HeroChart } from "@/components/simulator/HeroChart";
import { Simulator } from "@/components/simulator/Simulator";
import { WaitlistCount } from "@/components/waitlist/WaitlistCount";
import { WaitlistForm } from "@/components/waitlist/WaitlistForm";

// The three points from the old "Why wait" section, condensed into bullets under the hero
const facts = ["Buy low or sell high", "Upfront yield, yours to keep", "Get back your money without any loss", "Settled once, at your deadline"];

function Check() {
  return (
    <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Page order: hero → how it works → simulator (the focus, full-width light green) → more assets → FAQ → early access
export default function Home() {
  return (
    <>
      <SiteHeader />

      <main id="main">
        <div id="top" className="mx-auto max-w-6xl divide-y divide-rule px-6">
          <section aria-labelledby="hero-title" className="grid gap-10 pb-10 pt-12 md:grid-cols-[1fr_1fr] md:gap-0 md:pb-12 md:pt-16">
            <div className="md:pr-10">
              <h1 id="hero-title" className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
                Get paid while you wait PAYtiently.
              </h1>
              <ul className="mt-6 space-y-2 text-base">
                {facts.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <WaitlistForm variant="hero" />
              </div>
              <div className="mt-3 min-h-5">
                <WaitlistCount />
              </div>
            </div>
            <div className="md:border-l md:border-ink md:pl-10">
              <HeroChart />
            </div>
          </section>

          <HowItWorks />
        </div>

        <Simulator />

        <div className="mx-auto max-w-6xl divide-y divide-rule px-6">
          <Assets />
          <Faq />
        </div>

        <EarlyAccess />
      </main>

      <SiteFooter />
    </>
  );
}
