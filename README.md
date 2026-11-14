# PAYtience landing page

Landing page and email waitlist for PAYtience: name your price for crypto, and either get it by
your deadline or get your money back.

Built with Next.js (App Router), TypeScript, Tailwind CSS and MongoDB.

## Getting started

```
npm install
cp .env.example .env.local   # optional: fill in the MongoDB connection string
npm run dev                  # http://localhost:3000
```

The page runs without MongoDB: in development the waitlist then uses an in-memory store
(reset on restart). Joining takes only an email address; there are no accounts or sign-in.

## Commands

```
npm run dev          # development server
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm test             # vitest run
```

The unit tests use jsdom 31, which needs Node 22.22+, 24.15+ or 26+.

## Documentation

- [docs/STACK.md](docs/STACK.md): tech stack, design tokens and folder conventions
- [docs/WAITLIST.md](docs/WAITLIST.md): the waitlist API, storage and deployment
