import Stripe from "stripe";
import { EXTRA_MATCH_PRICE } from "@/lib/plan";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

// Display + checkout config. Prices here are for display; the actual
// charge uses the Stripe Price ID from env (STRIPE_PRICE_STARTER /
// STRIPE_PRICE_PRO). Keep in sync with PLAN_FEATURES in src/lib/plan.ts.
export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    priceId: null as string | null,
    // Free is a demo tier: the built-in sample match, not your own video.
    features: [
      "Explore a full sample match",
      "See every stat, highlight & AI report",
      "No analysis of your own video",
      "Community support",
    ],
  },
  STARTER: {
    name: "Starter",
    price: 9.99,
    priceId: process.env.STRIPE_PRICE_STARTER ?? null,
    features: [
      "1 full analysis / month",
      "Heat maps & shot charts",
      "AI coaching reports",
      "Highlight reels",
      "Season progress tracking",
      `Extra matches $${EXTRA_MATCH_PRICE.toFixed(2)} each`,
    ],
  },
  PRO: {
    name: "Pro",
    price: 19.99,
    priceId: process.env.STRIPE_PRICE_PRO ?? null,
    features: [
      "3 full analyses / month",
      "Heat maps & shot charts",
      "AI coaching reports",
      "Highlight reels",
      "Season progress tracking",
      `Extra matches $${EXTRA_MATCH_PRICE.toFixed(2)} each`,
      "Priority support",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
