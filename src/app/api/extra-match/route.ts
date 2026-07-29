import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { stripe, PLANS } from "@/lib/stripe";
import { getEffectivePlan, EXTRA_MATCH_PRICE } from "@/lib/plan";

// POST /api/extra-match
// Starts a Stripe Checkout for a one-time extra-match purchase.
// Until Stripe is fully configured, returns a clear "not ready" message.
//
// When Stripe IS configured, the webhook credits the user's
// extraMatchCredits on successful payment (see stripe/webhook route).
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { features } = getEffectivePlan({ email: user.email, plan: user.plan as any });
  if (!features.allowsExtraMatches) {
    return NextResponse.json(
      { error: "Your plan doesn't support extra matches. Upgrade to a paid plan first." },
      { status: 403 }
    );
  }

  // Stripe not configured yet -> honest message, no fake charge.
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("placeholder")) {
    return NextResponse.json(
      {
        error: "Pay-per-match isn't live yet — billing is still being set up. Check back soon!",
        code: "BILLING_NOT_READY",
      },
      { status: 503 }
    );
  }

  // Reuse or create a Stripe customer.
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "Elevate — Extra match analysis" },
          unit_amount: Math.round(EXTRA_MATCH_PRICE * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/upload?extra=1`,
    cancel_url: `${appUrl}/dashboard`,
    metadata: { userId: user.id, type: "extra_match" },
  });

  return NextResponse.json({ url: session.url });
}
