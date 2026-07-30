"use client";
import { usePathname } from "next/navigation";
import { motion, MotionConfig } from "framer-motion";
import { EASE, DUR } from "@/components/motion";

/**
 * Wraps the marketing pages so they share the app's motion settings and
 * the same gentle page fade the dashboard uses — signing in shouldn't
 * feel like crossing into a different product.
 *
 * Entrance-only, keyed on pathname, for the same reason as AppShell: the
 * App Router unmounts the outgoing tree as soon as the new route
 * commits, so an exit animation would just hold stale content on screen.
 */
export function MarketingFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DUR.base, ease: EASE }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
