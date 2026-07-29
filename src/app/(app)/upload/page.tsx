import Link from "next/link";
import { Lock, Sparkles, Eye } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getEffectivePlan } from "@/lib/plan";
import { UploadFlow } from "@/components/upload/UploadFlow";

export default async function UploadPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { features } = getEffectivePlan({ email: user.email, plan: user.plan as any });

  // Free tier is a demo: no own-video analysis. Say so plainly here rather
  // than letting someone pick a file and hit a 403 three steps later.
  // (/api/upload and /api/analyze enforce the same rule server-side.)
  if (features.isDemo) {
    return (
      <div className="max-w-lg">
        <div className="card p-8 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4"
            style={{ background: "linear-gradient(135deg,#4F7DF3,#8B5CF6)" }}>
            <Lock size={24} />
          </div>
          <h1 className="text-xl font-semibold">Analyzing your own match needs a paid plan</h1>
          <p className="text-sm text-brand-muted mt-2">
            You&apos;re on the <strong>Free</strong> plan, which is a demo — it includes the
            full sample match so you can see exactly what Elevate produces, but not
            analysis of your own video.
          </p>
          <p className="text-sm text-brand-muted mt-3">
            Upgrade to <strong>Starter</strong> ($9.99/mo — 1 match) or <strong>Pro</strong>{" "}
            ($19.99/mo — 3 matches) to upload your game.
          </p>

          <Link href="/pricing"
            className="mt-6 w-full px-6 py-3 rounded-2xl text-white font-medium flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg,#4F7DF3,#6E6BF5)" }}>
            <Sparkles size={16} /> See plans
          </Link>
          <Link href="/matches/sample"
            className="mt-3 w-full px-6 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 border"
            style={{ borderColor: "#E4E7EF", color: "#12141C" }}>
            <Eye size={16} /> View the sample match
          </Link>
        </div>
      </div>
    );
  }

  // Returning users get their usual jersey/position pre-filled.
  const profile = user.athleteProfile;
  return (
    <UploadFlow
      defaultJersey={profile?.defaultJersey ?? ""}
      defaultPosition={profile?.position ?? ""}
    />
  );
}
