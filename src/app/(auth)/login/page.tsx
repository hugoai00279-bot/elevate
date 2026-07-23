"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      router.push(next);
    }
  }

  return (
    <div className="card p-8 w-full max-w-sm">
      <h1 className="text-2xl font-semibold">Welcome back</h1>
      <p className="text-sm text-brand-muted mt-1">Log in to your Elevate account.</p>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <input required type="email" placeholder="Email address" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-[#E4E7EF] bg-white" />
        <input required type="password" placeholder="Password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-[#E4E7EF] bg-white" />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button disabled={loading}
          className="w-full py-3 rounded-xl font-medium text-white disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#4F7DF3,#6E6BF5)" }}>
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="text-sm text-brand-muted mt-5 text-center">
        No account yet? <Link href="/signup" className="text-brand font-medium">Sign up</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
