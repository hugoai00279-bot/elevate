import { getCurrentUser } from "@/lib/session";
import { UploadFlow } from "@/components/upload/UploadFlow";

export default async function UploadPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Returning users get their usual jersey/position pre-filled.
  const profile = user.athleteProfile;
  return (
    <UploadFlow
      defaultJersey={profile?.defaultJersey ?? ""}
      defaultPosition={profile?.position ?? ""}
    />
  );
}
