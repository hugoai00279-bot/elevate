import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    priceId: null as string | null,
    features: ["1 match analysis / month", "Basic stats", "Community support"],
  },
  PRO: {
    name: "Pro",
    price: 7.99,
    priceId: process.env.STRIPE_PRICE_PRO ?? null,
    features: [
      "Unlimited match analysis",
      "Full stats, heat maps & shot charts",
      "AI coaching reports",
      "Highlight reels",
      "Season progress tracking",
    ],
  },
  TEAM: {
    name: "Team",
    price: 24.99,
    priceId: process.env.STRIPE_PRICE_TEAM ?? null,
    features: [
      "Everything in Pro",
      "Up to 15 athletes",
      "Coach dashboard",
      "Team-wide comparisons",
      "Priority support",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
