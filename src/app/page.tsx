import { Faq } from "@/components/sections/Faq";
import { GoodToKnow } from "@/components/sections/GoodToKnow";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { EarlyAccess, SiteFooter, SiteHeader } from "@/components/sections/SiteChrome";
import { HeroChart } from "@/components/simulator/HeroChart";
import { Simulator } from "@/components/simulator/Simulator";
import { JoinLink } from "@/components/waitlist/JoinLink";
import { WaitlistCount } from "@/components/waitlist/WaitlistCount";

// 原来 “Why wait” 区块的三点，压缩成头图下面的要点
const facts = ["No chart-watching", "You pick the price & deadline", "Full refund if it doesn't fill"];

function Check() {
  return (
    <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 text-accent" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// 页面顺序：头图 → 三步说明 → 模拟器（重点，浅绿全宽）→ 规则 → 常见问题 → 分批开放
export default function Home() {
  return (
    <>
      <SiteHeader />

      <main id="main">
        <div id="top" className="mx-auto max-w-6xl divide-y divide-rule px-6">
          <section aria-labelledby="hero-title" className="grid gap-10 py-10 md:grid-cols-[1fr_1fr] md:gap-0 md:py-12">
            <div className="md:pr-10">
              <h1 id="hero-title" className="font-serif text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
                Name your price. Get it — or get refunded.
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-ink/85">
                Choose your crypto, set a lower price and a deadline. If the market reaches your target, we buy for you. If it
                doesn&apos;t, you get a full refund.
              </p>
              <ul className="mt-6 space-y-2 text-sm">
                {facts.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <JoinLink className="inline-flex min-h-12 items-center bg-accent px-7 text-sm font-semibold text-paper transition-colors hover:bg-ink">
                  Join the waitlist
                </JoinLink>
              </div>
              <div className="mt-4 min-h-5">
                <WaitlistCount />
              </div>
              <p className="mt-1 text-xs text-ink/70">Early access opens in waves — your place in line decides when you get in.</p>
            </div>
            <div className="md:border-l md:border-ink md:pl-10">
              <HeroChart />
            </div>
          </section>

          <HowItWorks />
        </div>

        <Simulator />

        <div className="mx-auto max-w-6xl divide-y divide-rule px-6">
          <GoodToKnow />
          <Faq />
        </div>

        <EarlyAccess />
      </main>

      <SiteFooter />
    </>
  );
}
