import type { Config } from "tailwindcss";

// 字号只用 7 级：12 / 14 / 16 / 20 / 28 / 40 / 60。
// lg 和 xl 合成 20，2xl 和 3xl 合成 28，避免页面上出现太多相近的字号。
const lead = (size: string, lineHeight: string) => [size, { lineHeight }] as [string, { lineHeight: string }];

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F3EC",
        ink: "#1A1A1A",
        // 成交：松绿
        accent: "#1F4D3A",
        mint: "#E4EBE1",
        // 退款：回款蓝（和绿色在色盲下也分得开）
        refund: "#2D4E86",
        "refund-tint": "#E6ECF5",
        rule: "#D9D3C7",
      },
      fontFamily: {
        serif: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: lead("0.75rem", "1.125rem"),
        sm: lead("0.875rem", "1.375rem"),
        base: lead("1rem", "1.625rem"),
        lg: lead("1.25rem", "1.75rem"),
        xl: lead("1.25rem", "1.75rem"),
        "2xl": lead("1.75rem", "2.125rem"),
        "3xl": lead("1.75rem", "2.125rem"),
        "4xl": lead("2.5rem", "2.75rem"),
        "5xl": lead("2.5rem", "2.75rem"),
        "6xl": lead("3.75rem", "3.875rem"),
      },
    },
  },
};

export default config;
