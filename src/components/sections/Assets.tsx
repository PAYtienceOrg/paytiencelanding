import Image from "next/image";
import { SectionHeading } from "./SectionHeading";

type Asset = { ticker: string; name: string; logo: string };

// Logos live in public/assets. The lists mirror the assets shown in the PAYtience app.
const groups: { title: string; note: string; soon?: boolean; assets: Asset[] }[] = [
  {
    title: "Stocks",
    note: "Tokenized shares of listed companies.",
    assets: [
      { ticker: "NVDA", name: "NVIDIA", logo: "/assets/nvdaon.svg" },
      { ticker: "TSLA", name: "Tesla", logo: "/assets/tslaon.svg" },
      { ticker: "HYNIX", name: "SK hynix", logo: "/assets/hynixon.svg" },
    ],
  },
  {
    title: "ETFs",
    note: "Tokenized funds that track an index or a commodity.",
    assets: [
      { ticker: "SPY", name: "S&P 500", logo: "/assets/spyon.svg" },
      { ticker: "QQQ", name: "Nasdaq-100", logo: "/assets/qqqon.svg" },
      { ticker: "XAG", name: "Silver", logo: "/assets/xagon.svg" },
    ],
  },
  {
    title: "Pre-stocks",
    note: "Tokenized shares of companies before they list.",
    soon: true,
    assets: [
      { ticker: "Anthropic", name: "Anthropic", logo: "/assets/anthropic.png" },
      { ticker: "OpenAI", name: "OpenAI", logo: "/assets/openai.png" },
      { ticker: "SpaceX", name: "SpaceX", logo: "/assets/spacex.png" },
      { ticker: "Anduril", name: "Anduril", logo: "/assets/anduril.png" },
      { ticker: "Neuralink", name: "Neuralink", logo: "/assets/neuralink.png" },
      { ticker: "Figure AI", name: "Figure AI", logo: "/assets/figureai.png" },
      { ticker: "Kalshi", name: "Kalshi", logo: "/assets/kalshi.png" },
      { ticker: "Polymarket", name: "Polymarket", logo: "/assets/polymarket.png" },
    ],
  },
];

// What else can be bought low or sold high: stocks and ETFs, with pre-stocks marked as coming soon.
export function Assets() {
  return (
    <section id="assets" aria-labelledby="assets-title" className="scroll-mt-20 py-12">
      <div className="grid gap-8 md:grid-cols-[1fr_1.6fr] md:gap-12">
        <SectionHeading id="assets-title" title="More than crypto." intro="Stocks and ETFs are on the way too, with pre-stocks coming soon." />
        <div className="border-b border-rule">
          {groups.map((g) => (
            <div key={g.title} className="border-t border-rule py-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h3 className="font-serif text-lg font-semibold">{g.title}</h3>
                {g.soon && <span className="border border-accent px-2 py-0.5 text-xs font-semibold text-accent">Coming soon</span>}
              </div>
              <p className="mt-1 text-sm text-ink/80">{g.note}</p>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-3">
                {g.assets.map((a) => (
                  <li key={a.ticker} className="flex items-center gap-2 text-sm font-semibold" title={a.name}>
                    <Image src={a.logo} alt="" width={32} height={32} unoptimized className={`h-8 w-8 rounded-full ${g.soon ? "opacity-70" : ""}`} />
                    {a.ticker}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
