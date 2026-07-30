"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { BallIcon } from "./BallIcon";
import { EASE } from "./motion";

const links = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // The home hero is a dark stage, so at the top of that page the nav
  // switches to light-on-dark and drops its background entirely. Every
  // other page (and the home page once scrolled) keeps the light chrome.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll(); // set correctly on first paint and after a route change
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onDark = pathname === "/" && !scrolled;

  return (
    <header
      className="sticky top-0 z-40 transition-colors duration-300"
      style={{
        background: onDark ? "transparent" : "rgba(251,252,255,0.72)",
        backdropFilter: onDark ? "none" : "blur(12px)",
        borderBottom: onDark ? "1px solid transparent" : "1px solid #EEF0F5",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="press flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-transform duration-500 group-hover:rotate-[180deg]"
            style={{ background: "linear-gradient(135deg,#4F7DF3,#8B5CF6)" }}>
            <BallIcon size={17} />
          </span>
          <span className="font-semibold" style={{ color: onDark ? "#FFFFFF" : "#12141C" }}>
            Elevate
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href}
                className="relative px-3.5 py-2 text-sm transition-colors rounded-full"
                style={{
                  color: active
                    ? (onDark ? "#FFFFFF" : "#12141C")
                    : (onDark ? "rgba(214,224,255,0.66)" : "#6B7280"),
                }}>
                {/* One shared layoutId, so the pill slides between items
                    instead of fading out and in. */}
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full -z-10"
                    style={{
                      background: onDark ? "rgba(255,255,255,0.10)" : "rgba(79,125,243,0.09)",
                      border: onDark ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(79,125,243,0.14)",
                    }}
                    transition={{ duration: 0.35, ease: EASE }}
                  />
                )}
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="press text-sm font-medium"
            style={{ color: onDark ? "rgba(226,233,255,0.9)" : "#12141C" }}>
            Log in
          </Link>
          <Link href="/signup"
            className="press sheen text-sm font-medium text-white px-4 py-2 rounded-xl"
            style={{
              background: "linear-gradient(135deg,#4F7DF3,#6E6BF5)",
              boxShadow: onDark ? "0 10px 26px -10px rgba(79,125,243,0.8)" : "none",
            }}>
            Sign up
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu"
          style={{ color: onDark ? "#FFFFFF" : "#12141C" }}>
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
