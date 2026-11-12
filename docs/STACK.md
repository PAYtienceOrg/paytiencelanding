# Tech stack

## Choices and reasons

| Choice | Reason |
| --- | --- |
| Next.js (App Router, TypeScript, `src/`) | Static and server rendering, with routing and font optimisation built in |
| pnpm | Fast installs, strict dependencies |
| Tailwind CSS | Theme tokens keep colours and fonts consistent, with no scattered CSS |
| framer-motion | The only animation library; covers entrances, scroll and gestures |
| zod | Validation for forms and API data |
| Supabase | Waitlist storage (called over REST with `fetch`, no client library) |
| Vitest + @testing-library/react + jsdom | Fast component unit tests |
| Playwright | End-to-end tests (none written yet) |

## Commands

```
pnpm dev         # development server at http://localhost:3000
pnpm build       # production build
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint
pnpm test        # vitest run
pnpm test:e2e    # playwright test
```

## Colours and fonts

Defined in `tailwind.config.ts` (the colours are mirrored as CSS variables in `src/app/globals.css`):

| Class | Value | Use |
| --- | --- | --- |
| `paper` | `#F7F3EC` | Background |
| `ink` | `#1A1A1A` | Body text |
| `accent` | `#1F4D3A` | Pine green: emphasis and filled orders |
| `mint` | `#E4EBE1` | Light green tint |
| `refund` | `#2D4E86` | Blue: refunds |
| `refund-tint` | `#E6ECF5` | Light blue tint |
| `rule` | `#D9D3C7` | Thin dividers |

- Headings and large numbers: Newsreader (`font-serif`, variable `--font-display`)
- Body and UI: IBM Plex Sans (`font-sans`, variable `--font-sans`)
- Prices: add `tabular-nums` (Tailwind class) or the `.price` class
- The type scale has seven sizes: 12 / 14 / 16 / 20 / 28 / 40 / 60

## Folder conventions

- `src/components/sections/`: page sections
- `src/components/simulator/`: the price simulator and the hero chart
- `src/components/motion/`: shared motion components
- `src/components/waitlist/`: the sign-up form, invite link and counter
- `src/lib/waitlist/`: the waitlist service and its storage adapters
- `src/app/preview/registry.ts`: maps a preview name to a component; visit `/preview/<name>` (returns 404 in production)

## Do not add

- Other animation libraries (such as GSAP)
- UI component libraries
- ORMs such as Prisma or Drizzle
- CSS-in-JS
- Accounts or sign-in: the waitlist takes an email address only
