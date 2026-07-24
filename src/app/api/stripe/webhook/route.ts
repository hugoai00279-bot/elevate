import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Stripe requires the raw body to verify the signature.
export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const type = session.metadata?.type;

        if (userId && type === "extra_match") {
          // One-time pay-per-match purchase: grant one analysis credit.
          await prisma.user.update({
            where: { id: userId },
            data: { extraMatchCredits: { increment: 1 } },
          });
        } else if (userId && session.metadata?.plan) {
          // Subscription upgrade: set the user's plan.
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: session.metadata.plan as any,
              stripeSubscriptionId: (session.subscription as string) ?? null,
            },
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { plan: "FREE", stripeSubscriptionId: null },
        });
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const renews = (sub as any).current_period_end
          ? new Date((sub as any).current_period_end * 1000)
          : null;
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { planRenewsAt: renews },
        });
        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
