import { MarketingNav } from "@/components/MarketingNav";
import { Footer } from "@/components/Footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ambient-light min-h-screen">
      <MarketingNav />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
