import { HomeSections } from "@/components/marketing/HomeSections";

// The page stays a server component; everything interactive (the 3D
// stage, scroll reveals, spotlight cards) lives in HomeSections so only
// that subtree ships to the client.
export default function HomePage() {
  return <HomeSections />;
}
