# Paytience landing page

Landing page and email waitlist for Paytience: name your price for crypto, and either get it by
your deadline or get refunded.

Built with Next.js (App Router), TypeScript, Tailwind CSS and Supabase.

## Getting started

```
pnpm install
cp .env.example .env.local   # optional: fill in the Supabase values
pnpm dev                     # http://localhost:3000
```

The page runs without Supabase: in development the waitlist then uses an in-memory store
(reset on restart). Joining takes only an email address; there are no accounts or sign-in.

## Commands

```
pnpm dev         # development server
pnpm build       # production build
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint
pnpm test        # vitest run
```

The unit tests use jsdom 31, which needs Node 22.22+, 24.15+ or 26+.

## Documentation

- [docs/STACK.md](docs/STACK.md): tech stack, design tokens and folder conventions
- [docs/WAITLIST.md](docs/WAITLIST.md): the waitlist API, storage and deployment
- [docs/waitlist.sql](docs/waitlist.sql): database setup, run once in the Supabase SQL editor
