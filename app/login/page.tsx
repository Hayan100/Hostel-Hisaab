"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { PEOPLE, Person } from "@/lib/types";
import { LedgerIcon } from "@/components/Icons";

export default function LoginPage() {
  const [name, setName] = useState<Person>("Hayan");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const email = `${name.toLowerCase()}@hostelhisaab.app`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setError("Password kam az kam 6 characters ka hona chahiye.");
      setLoading(false);
      return;
    }

    if (isSignup) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (signUpError) {
        setError(signUpError.message === "User already registered"
          ? "Yeh account pehle se bana hua hai. Login karo."
          : signUpError.message);
        setLoading(false);
        return;
      }
      // After signup, log in immediately
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) {
        setError("Account ban gaya! Ab login karo.");
        setIsSignup(false);
        setLoading(false);
        return;
      }
    } else {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) {
        setError("Password galat hai ya account nahi bana.");
        setLoading(false);
        return;
      }
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <LedgerIcon size={56} />
          <h1 className="text-2xl font-bold text-gray-800 mt-3">Hostel Hisaab</h1>
          <p className="text-sm text-gray-400 mt-1">Hayan · Usman · Mubassir · Hasnain</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-bold text-gray-700 mb-5">
            {isSignup ? "Pehli Baar? Account Banao" : "Wapas Aaye?"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kaun Ho Tum?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PEOPLE.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setName(p)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                      name === p
                        ? "border-teal-500 bg-teal-50 text-teal-800"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                autoComplete={isSignup ? "new-password" : "current-password"}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-teal-400"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl border border-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all disabled:opacity-60"
            >
              {loading ? "Ruko..." : isSignup ? "Account Banao" : "Andar Jao"}
            </button>
          </form>

          <button
            onClick={() => { setIsSignup(!isSignup); setError(""); }}
            className="w-full text-center text-sm text-gray-400 hover:text-teal-600 mt-4 transition-colors"
          >
            {isSignup ? "Pehle se account hai? Login karo" : "Pehli baar? Account banao"}
          </button>
        </div>
      </div>
    </div>
  );
}
