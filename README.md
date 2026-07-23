# Elevate

AI volleyball performance analysis platform. Players upload match footage and
get automatic statistics, highlight reels, and a personalized AI coaching
report.

Built with Next.js (App Router), TypeScript, Tailwind, Prisma + Postgres,
NextAuth, Stripe, and Mux.

## Quick start

```bash
npm install
cp .env.example .env      # fill in values
npm run db:push           # create database tables
npm run dev               # http://localhost:3000
```

**Full setup, including creating your database, Stripe, Mux, and Vercel
accounts from scratch, is in [`SETUP_GUIDE.md`](./SETUP_GUIDE.md).**

## Key pages

| Route | Purpose |
|-------|---------|
| `/` | Home / landing |
| `/features`, `/pricing`, `/about`, `/contact` | Marketing |
| `/privacy`, `/terms` | Legal |
| `/signup`, `/login` | Auth |
| `/dashboard` | Your season overview (auth) |
| `/upload` | Upload → identify → tap-to-select → analyze (auth) |
| `/matches/[id]` | Full analysis results for one match (auth) |
| `/profile` | Profile & settings (auth) |

## The analysis seam

All match analysis routes through `src/lib/analysis/provider.ts`. It ships
with a clearly-labeled simulated provider and a stub for your real
computer-vision backend. See section 6 of the setup guide.
