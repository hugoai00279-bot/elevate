import { MarketingNav } from "@/components/MarketingNav";
import { Footer } from "@/components/Footer";
import { MarketingFrame } from "@/components/marketing/MarketingFrame";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ambient-light min-h-screen">
      <MarketingNav />
      <main>
        <MarketingFrame>{children}</MarketingFrame>
      </main>
      <Footer />
    </div>
  );
}
