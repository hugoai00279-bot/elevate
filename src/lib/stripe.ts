import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

// Display + checkout config for each subscription plan. Prices here are
// for display; the actual charge uses the Stripe Price IDs from env.
export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    priceId: null as string | null,
    features: [
      "1 match / month",
      "Basic stats & AI rating",
      "Community support",
    ],
  },
  STARTER: {
    name: "Starter",
    price: 12.99,
    priceId: process.env.STRIPE_PRICE_STARTER ?? null,
    features: [
      "1 full analysis / month",
      "Heat maps & shot charts",
      "AI coaching reports",
      "Highlight reels",
      "Extra matches $7.50 each",
    ],
  },
  PRO: {
    name: "Pro",
    price: 29.99,
    priceId: process.env.STRIPE_PRICE_PRO ?? null,
    features: [
      "4 full analyses / month",
      "Everything in Starter",
      "Season progress tracking",
      "Priority processing",
      "Extra matches $7.50 each",
    ],
  },
  TEAM: {
    name: "Team",
    price: 59.99,
    priceId: process.env.STRIPE_PRICE_TEAM ?? null,
    features: [
      "10 shared analyses / month",
      "Up to 15 athletes",
      "Coach dashboard",
      "Team-wide comparisons",
      "Priority support",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
