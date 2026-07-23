import Link from "next/link";
import { BallIcon } from "@/components/BallIcon";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ambient-light min-h-screen flex flex-col">
      <div className="p-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
            style={{ background: "linear-gradient(135deg,#4F7DF3,#8B5CF6)" }}>
            <BallIcon size={17} />
          </span>
          <span className="font-semibold">Elevate</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 pb-16">{children}</div>
    </div>
  );
}
