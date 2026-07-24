"use client";
import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";

/**
 * Wraps a premium section (heat map, AI coach, etc.). When locked,
 * shows a blurred preview of the real content with an upgrade CTA on
 * top — so Free users see exactly what they're missing, not just an
 * empty box.
 */
export function LockedFeature({
  locked,
  title,
  children,
}: {
  locked: boolean;
  title: string;
  children: React.ReactNode;
}) {
  if (!locked) return <>{children}</>;

  return (
    <div className="relative rounded-2xl overflow-hidden">
      <div className="pointer-events-none select-none" style={{ filter: "blur(6px)", opacity: 0.5 }}>
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(1px)" }}>
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-white mb-3"
          style={{ background: "linear-gradient(135deg,#4F7DF3,#8B5CF6)" }}>
          <Lock size={18} />
        </div>
        <p className="text-sm font-semibold" style={{ color: "#12141C" }}>{title} is a Pro feature</p>
        <Link href="/pricing"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full text-white"
          style={{ background: "linear-gradient(135deg,#4F7DF3,#6E6BF5)" }}>
          <Sparkles size={12} /> Upgrade to unlock
        </Link>
      </div>
    </div>
  );
}
