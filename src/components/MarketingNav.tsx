"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BallIcon } from "./BallIcon";

const links = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md" style={{ background: "rgba(251,252,255,0.7)" }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg,#4F7DF3,#8B5CF6)" }}>
            <BallIcon size={17} />
          </span>
          <span className="font-semibold">Elevate</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-brand-muted hover:text-brand-ink transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-brand-ink">Log in</Link>
          <Link href="/signup"
            className="text-sm font-medium text-white px-4 py-2 rounded-xl"
            style={{ background: "linear-gradient(135deg,#4F7DF3,#6E6BF5)" }}>
            Sign up
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#EEF0F5] bg-white px-6 py-4 space-y-3">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="block text-sm text-brand-muted" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2">
            <Link href="/login" className="text-sm font-medium">Log in</Link>
            <Link href="/signup" className="text-sm font-medium text-brand">Sign up</Link>
          </div>
        </div>
      )}
    </header>
  );
}
