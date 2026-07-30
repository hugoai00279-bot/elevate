import Link from "next/link";
import { BallIcon } from "@/components/BallIcon";
import { MotionConfig } from "framer-motion";
import { Reveal } from "@/components/motion";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="ambient-light min-h-screen flex flex-col">
        <div className="p-6">
          <Link href="/" className="press inline-flex items-center gap-2 group">
            <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-transform duration-500 group-hover:rotate-[180deg]"
              style={{ background: "linear-gradient(135deg,#4F7DF3,#8B5CF6)" }}>
              <BallIcon size={17} />
            </span>
            <span className="font-semibold">Elevate</span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          {/* Same entrance the dashboard uses, so the hand-off from
              marketing to signed-in feels continuous. */}
          <Reveal y={14} className="w-full flex justify-center">
            {children}
          </Reveal>
        </div>
      </div>
    </MotionConfig>
  );
}
