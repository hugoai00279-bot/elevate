import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#EEF0F5] mt-20">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between gap-6 text-sm text-brand-muted">
        <div>
          <div className="font-semibold text-brand-ink">Elevate</div>
          <p className="mt-1 max-w-xs">AI volleyball performance analysis for every player.</p>
        </div>
        <div className="flex gap-10">
          <div className="space-y-2">
            <div className="font-medium text-brand-ink">Product</div>
            <Link href="/features" className="block hover:text-brand-ink">Features</Link>
            <Link href="/pricing" className="block hover:text-brand-ink">Pricing</Link>
            <Link href="/signup" className="block hover:text-brand-ink">Sign up</Link>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-brand-ink">Company</div>
            <Link href="/about" className="block hover:text-brand-ink">About</Link>
            <Link href="/contact" className="block hover:text-brand-ink">Contact</Link>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-brand-ink">Legal</div>
            <Link href="/privacy" className="block hover:text-brand-ink">Privacy</Link>
            <Link href="/terms" className="block hover:text-brand-ink">Terms</Link>
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-brand-faint pb-8">
        © {new Date().getFullYear()} Elevate. All rights reserved.
      </div>
    </footer>
  );
}
