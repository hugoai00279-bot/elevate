import Link from "next/link";

export default function NotFound() {
  return (
    <div className="ambient-light min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl font-semibold tracking-tight">404</div>
      <p className="text-brand-muted mt-3">We couldn&apos;t find that page.</p>
      <Link href="/" className="mt-6 px-6 py-3 rounded-2xl text-white font-medium"
        style={{ background: "linear-gradient(135deg,#4F7DF3,#6E6BF5)" }}>
        Back home
      </Link>
    </div>
  );
}
