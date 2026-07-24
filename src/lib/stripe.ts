import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

// Display + checkout config. Prices here are for display; the actual
// charge uses the Stripe Price ID from env (STRIPE_PRICE_PRO).
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
  PRO: {
    name: "Pro",
    price: 19.99,
    priceId: process.env.STRIPE_PRICE_PRO ?? null,
    features: [
      "2 full analyses / month",
      "Heat maps & shot charts",
      "AI coaching reports",
      "Highlight reels",
      "Season progress tracking",
      "Extra matches $7.50 each",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
