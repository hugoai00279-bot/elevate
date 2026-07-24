import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getEffectivePlan } from "@/lib/plan";
import { AppShell } from "@/components/dashboard/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const { features } = getEffectivePlan({ email: user.email, plan: user.plan as any });

  return <AppShell showTeamNav={features.coachDashboard}>{children}</AppShell>;
}
