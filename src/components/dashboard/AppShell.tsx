"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { EASE, DUR } from "./motion";
import {
  LayoutGrid, Upload, User, Menu, X, ChevronLeft, LogOut, CreditCard, Crown,
  BarChart3, Film, TrendingUp, Target, ListVideo,
} from "lucide-react";
import { BallIcon } from "@/components/BallIcon";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/matches", label: "My Matches", icon: ListVideo },
  { href: "/statistics", label: "Statistics", icon: BarChart3 },
  { href: "/highlights", label: "Highlights", icon: Film },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/upload", label: "Upload Match", icon: Upload },
  { href: "/profile", label: "Profile & Settings", icon: User },
];

export function AppShell({ children, showTeamNav = false }: { children: React.ReactNode; showTeamNav?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);

  const NavList = ({ onNav }: { onNav?: () => void }) => (
    <nav className="space-y-1">
      {nav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <button key={item.href}
            onClick={() => { router.push(item.href); onNav?.(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: active ? "linear-gradient(135deg,#4F7DF314,#8B5CF614)" : "transparent",
              color: active ? "#4F7DF3" : "#5B6472",
            }}>
            <item.icon size={17} /> {item.label}
          </button>
        );
      })}
      {showTeamNav && (
        <button
          onClick={() => { router.push("/team"); onNav?.(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{
            background: pathname.startsWith("/team")
              ? "linear-gradient(135deg,#8B5CF614,#4F7DF314)"
              : "linear-gradient(135deg,rgba(139,92,246,0.06),rgba(79,125,243,0.06))",
            color: pathname.startsWith("/team") ? "#8B5CF6" : "#6D4CC7",
          }}>
          <Crown size={17} /> Team dashboard
        </button>
      )}
      <Link href="/pricing" onClick={onNav}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-muted">
        <CreditCard size={17} /> Upgrade
      </Link>
      <button onClick={() => signOut({ callbackUrl: "/" })}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500">
        <LogOut size={17} /> Sign out
      </button>
    </nav>
  );

  return (
    <MotionConfig reducedMotion="user">
    <div className="ambient-light min-h-screen relative">
      {/* Persistent top-left Elevate button — always returns to landing */}
      <div className="fixed top-0 left-0 z-30 p-4 sm:p-5">
        <Link href="/"
          className="flex items-center gap-2 pl-2 pr-3.5 py-2 rounded-full border shadow-sm"
          style={{ background: "rgba(255,255,255,0.92)", borderColor: "#EEF0F5", backdropFilter: "blur(8px)" }}>
          <span className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg,#4F7DF3,#8B5CF6)" }}>
            <ChevronLeft size={14} />
          </span>
          <span className="text-sm font-semibold">Elevate</span>
        </Link>
      </div>

      {/* Mobile menu toggle */}
      <div className="fixed top-4 right-4 z-30 sm:hidden">
        <button onClick={() => setDrawer(true)}
          className="w-10 h-10 rounded-full flex items-center justify-center border shadow-sm bg-white">
          <Menu size={18} />
        </button>
      </div>

      <div className="relative z-10 flex max-w-7xl mx-auto pt-20 sm:pt-24 px-4 sm:px-6 pb-16 gap-6">
        <aside className="hidden sm:block w-60 shrink-0">
          <div className="sticky top-24"><NavList /></div>
        </aside>

        <AnimatePresence>
          {drawer && (
            <>
              <motion.div className="fixed inset-0 bg-black/30 z-40 sm:hidden"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setDrawer(false)} />
              <motion.div className="fixed top-0 left-0 h-full w-72 z-50 p-5 sm:hidden bg-white"
                initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }}
                transition={{ type: "tween", duration: 0.25 }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                      style={{ background: "linear-gradient(135deg,#4F7DF3,#8B5CF6)" }}>
                      <BallIcon size={15} />
                    </span>
                    <span className="text-sm font-semibold">Elevate</span>
                  </div>
                  <button onClick={() => setDrawer(false)}><X size={18} /></button>
                </div>
                <NavList onNav={() => setDrawer(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/*
          Page transition. Keyed on pathname so each dashboard section
          fades and rises in as it mounts.

          Deliberately entrance-only: with the App Router the outgoing
          tree unmounts the moment the new route commits, so an exit
          animation would mean holding stale content on screen and would
          read as lag on every click. Fading the incoming page keeps
          navigation feeling instant but not abrupt.
        */}
        <main className="flex-1 min-w-0">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.base, ease: EASE }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
    </MotionConfig>
  );
}
