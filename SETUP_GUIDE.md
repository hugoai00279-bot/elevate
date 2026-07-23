# Elevate — Setup & Deployment Guide

This is the real, deployable codebase for **Elevate**, an AI volleyball
performance analysis platform. It's a Next.js app with authentication, a
database, Stripe billing, video upload, and a clean seam for plugging in a
real computer-vision analysis backend later.

You told me you're starting fresh with **no accounts yet**, so this guide
assumes that. Follow it top to bottom and you'll have a live website.

---

## 0. What you need first

- **Node.js 18.18+** (20 or 22 recommended). Check with `node --version`.
- A **GitHub account** (free) — to store your code and connect to Vercel.
- About 30–45 minutes.

Everything else (database, Stripe, hosting) has a free tier and is created
during this guide.

---

## 1. Get the project running locally

```bash
# from inside the unzipped project folder
npm install
```

> If `npm install` prints a Prisma engine download message, that's normal —
> it downloads a small binary the first time. Let it finish.

Copy the example environment file:

```bash
cp .env.example .env
```

You'll fill in `.env` as you complete each section below. For a first local
run you only strictly need `DATABASE_URL` and `NEXTAUTH_SECRET`.

Generate your auth secret:

```bash
openssl rand -base64 32
```

Paste the output as `NEXTAUTH_SECRET` in `.env`.

---

## 2. Create the database (Supabase — free)

Elevate uses **Postgres**. Supabase gives you one free.

1. Go to **supabase.com** → create a free account → **New project**.
2. Pick a name and a strong database password (save it).
3. When the project is ready, go to **Project Settings → Database →
   Connection string → URI**.
4. Copy the URI and paste it into `.env` as `DATABASE_URL`.
   - Use the connection string that includes your password.
   - Supabase also offers a "connection pooling" string — either works;
     the direct one is simplest to start.

Now create all the tables from the schema:

```bash
npm run db:push
```

This reads `prisma/schema.prisma` and creates the User, Match, Stat,
Highlight, CoachingReport, AthleteProfile, and Organization tables.

Start the app:

```bash
npm run dev
```

Open **http://localhost:3000**. You can already:
- Sign up for an account (real, hashed password, saved to your database)
- Log in / log out
- Upload a match → identify yourself → tap to select → see analysis
- View your dashboard, matches, and profile

At this point everything works **except** real Stripe payments and real
cloud video storage, which need the next two sections.

---

## 3. Stripe billing (test mode first)

1. Go to **stripe.com** → create an account.
2. Stay in **Test mode** (toggle, top right) while building.
3. **Developers → API keys**: copy the **Secret key** (`sk_test_...`) and
   **Publishable key** (`pk_test_...`) into `.env`:
   - `STRIPE_SECRET_KEY=sk_test_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`
4. **Products → Add product**: create two products with **recurring monthly**
   prices:
   - "Elevate Pro" — e.g. $12/month
   - "Elevate Team" — e.g. $49/month
   After saving each, copy its **Price ID** (`price_...`) into `.env`:
   - `STRIPE_PRICE_PRO=price_...`
   - `STRIPE_PRICE_TEAM=price_...`
5. **Webhook** (so paying updates the user's plan):
   - For local testing, install the Stripe CLI and run:
     ```bash
     stripe listen --forward-to localhost:3000/api/stripe/webhook
     ```
     It prints a signing secret (`whsec_...`) → put it in `.env` as
     `STRIPE_WEBHOOK_SECRET`.
   - In production you'll instead add a webhook endpoint in the Stripe
     dashboard pointing to `https://yourdomain.com/api/stripe/webhook`
     and copy that endpoint's signing secret.

Now the **Upgrade** buttons on the Pricing page open real Stripe Checkout.
Use Stripe's test card `4242 4242 4242 4242`, any future expiry, any CVC.

When you're ready for real money, switch Stripe to **Live mode** and swap in
the live keys.

---

## 4. Video upload (Mux — recommended)

Volleyball match videos are large and long, so Elevate is wired for **Mux**,
which handles big/resumable uploads and streaming out of the box.

1. Go to **mux.com** → create an account.
2. **Settings → Access Tokens → Generate new token** with **Mux Video**
   read/write permission.
3. Copy the **Token ID** and **Token Secret** into `.env`:
   - `MUX_TOKEN_ID=...`
   - `MUX_TOKEN_SECRET=...`

With these set, uploads go to Mux and each match stores its asset ID.

> **No Mux yet?** The app still works — the upload step falls back to a dev
> mode that runs the whole flow without permanently storing the file. Great
> for testing the experience before committing to a video host.

---

## 5. Deploy to the internet (Vercel — free)

1. Push this project to a **GitHub** repo:
   ```bash
   git init && git add . && git commit -m "Elevate"
   # create a repo on github.com, then:
   git remote add origin https://github.com/YOU/elevate.git
   git push -u origin main
   ```
2. Go to **vercel.com** → sign in with GitHub → **Add New → Project** →
   import your repo.
3. In the Vercel project's **Settings → Environment Variables**, add every
   variable from your `.env` (DATABASE_URL, NEXTAUTH_SECRET,
   NEXTAUTH_URL, all the Stripe and Mux values).
   - Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your Vercel URL
     (e.g. `https://elevate.vercel.app`).
4. Deploy. Vercel runs the build (which runs `prisma generate`
   automatically via the `build` script).
5. Add your production Stripe webhook (section 3, step 5) pointing at your
   live domain.

That's a live website. 🎉

---

## 6. Where the REAL AI analysis plugs in

Right now, per-match results (stats, highlights, coaching report) come from a
**clearly-labeled simulated provider**. Every match view shows a "Demo
analysis" badge so results are never misrepresented as real.

**All analysis lives in exactly one file:**

```
src/lib/analysis/provider.ts
```

To connect a real computer-vision backend later:

1. Build/obtain a service that accepts a video + the player's tap location
   (`selectionX`, `selectionY`, already captured and stored per match) and
   returns detected volleyball actions.
2. Fill in the `realAnalysisProvider()` function in that file to call your
   service. It must return the same `AnalysisResult` shape with
   `simulated: false`.
3. Set `ANALYSIS_API_URL` and `ANALYSIS_API_KEY` in your environment.

Nothing else in the app changes. The tap-to-select step, the stored
coordinates, and the analysis step sequence were all designed as the
on-ramp for this.

> Real volleyball action recognition is a genuine machine-learning project
> (training or fine-tuning a video model, running it on GPUs). This codebase
> gives you everything around it so that work is the only thing left.

---

## 7. How the app is structured (for future expansion)

```
src/
  app/
    (marketing)/   Home, Features, Pricing, About, Contact, Privacy, Terms
    (auth)/        Login, Sign up
    (app)/         Dashboard, Upload, Matches/[id], Profile  (auth-protected)
    api/           register, upload, matches, analyze, stripe/*, contact, profile
  components/      shared + dashboard + upload UI
  lib/             prisma, auth, session, stripe, analysis/provider
prisma/
  schema.prisma    database models
```

The database schema already includes `Organization` and a `Role` enum
(ATHLETE / COACH / RECRUITER / ADMIN) plus a `sport` field, so the roadmap
items you mentioned — team accounts, coach dashboards, recruiters, multiple
sports, live analysis — extend this cleanly rather than requiring a rewrite.

---

## 8. Common issues

- **"@prisma/client did not initialize"** → run `npx prisma generate`
  (or just `npm install`, which runs it).
- **Database connection errors** → re-check `DATABASE_URL`; make sure the
  password is URL-encoded if it contains special characters.
- **Stripe checkout says "plan isn't configured"** → you haven't set the
  `STRIPE_PRICE_PRO` / `STRIPE_PRICE_TEAM` IDs.
- **Auth redirect loop** → make sure `NEXTAUTH_URL` matches the URL you're
  actually visiting.

---

## 9. A note on the two things that can't be faked

You asked for real analysis and a real protected database. This project
delivers a **real database** (section 2) with private per-user data and
properly hashed passwords. The **analysis** is honestly labeled as simulated
until you connect a CV backend (section 6), because truly understanding a
volleyball match from video requires a trained model running on a server —
not something any front-end can do on its own. Everything is built so that
final piece drops in without reworking the app.
