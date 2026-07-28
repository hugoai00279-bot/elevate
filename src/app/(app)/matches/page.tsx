import { getCurrentUser } from "@/lib/session";
import { loadUserMatches } from "@/lib/matchData";
import { MatchesClient } from "@/components/dashboard/MatchesClient";

export default async function MatchesPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const matches = await loadUserMatches(user.id);
  return <MatchesClient matches={matches} />;
}
