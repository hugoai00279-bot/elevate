import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import { AppShell } from "@/components/dashboard/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?next=/dashboard");
  return <AppShell>{children}</AppShell>;
}
