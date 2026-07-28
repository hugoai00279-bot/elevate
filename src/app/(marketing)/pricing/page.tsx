"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check } from "lucide-react";

const plans = [
  {
    key: "FREE", name: "Free", price: 0,
    features: ["1 match / month", "Basic stats & AI rating", "Community support"],
    cta: "Get started",
  },
  {
    key: "PRO", name: "Pro", price: 19.99, highlight: true,
    features: ["2 full analyses / month", "Heat maps & shot charts", "AI coaching reports", "Highlight reels", "Season progress tracking", "Extra matches $7.50 each"],
    cta: "Upgrade to Pro",
  },
];

export default function PricingPage() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(planKey: string) {
    if (planKey === "FREE") {
      router.push(status === "authenticated" ? "/dashboard" : "/signup");
      return;
    }
    if (status !== "authenticated") {
      router.push("/signup?next=/pricing");
      return;
    }
    setLoading(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url; // -> Stripe Checkout
      else alert(data.error || "Could not start checkout.");
    } catch {
      alert("Something went wrong starting checkout.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-semibold tracking-tight text-center">Simple, honest pricing</h1>
      <p className="text-brand-muted text-center mt-4">Start free. Upgrade when you&apos;re ready.</p>

      <div className="grid sm:grid-cols-2 gap-6 mt-14 max-w-2xl mx-auto">
        {plans.map((p) => (
          <div key={p.key}
            className="card p-7 flex flex-col"
            style={p.highlight ? { borderColor: "#4F7DF3", boxShadow: "0 12px 30px -12px rgba(79,125,243,0.35)" } : undefined}>
            {p.highlight && (
              <span className="self-start text-xs font-semibold px-2.5 py-1 rounded-full text-white mb-3"
                style={{ background: "linear-gradient(135deg,#4F7DF3,#8B5CF6)" }}>
                Most popular
              </span>
            )}
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <div className="mt-2 mb-5">
              <span className="text-4xl font-semibold">${p.price % 1 === 0 ? p.price : p.price.toFixed(2)}</span>
              <span className="text-brand-muted text-sm">/month</span>
            </div>
            <ul className="space-y-2.5 mb-7 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-brand-muted">
                  <Check size={16} className="text-brand mt-0.5 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade(p.key)}
              disabled={loading === p.key}
              className="w-full py-3 rounded-xl font-medium text-white disabled:opacity-60"
              style={{ background: p.highlight ? "linear-gradient(135deg,#4F7DF3,#6E6BF5)" : "#12141C" }}>
              {loading === p.key ? "Redirecting…" : p.cta}
            </button>
          </div>
        ))}
      </div>
      <p className="text-center text-sm text-brand-muted mt-8 max-w-lg mx-auto">
        Need more than your plan includes? Analyze extra matches anytime for
        <strong className="text-brand-ink"> $7.50 each</strong> — no need to upgrade.
      </p>
      <p className="text-center text-xs text-brand-faint mt-3">
        Payments are processed securely by Stripe. Cancel anytime.
      </p>
    </div>
  );
}
