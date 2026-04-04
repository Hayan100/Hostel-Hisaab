"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LedgerIcon } from "@/components/Icons";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError("Google se login nahi hua. Dobara try karo.");
      setLoading(false);
    }
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
          <h2 className="text-base font-bold text-gray-700 mb-2">Andar Aao</h2>
          <p className="text-xs text-gray-400 mb-6">
            Apne Google account se login karo — sirf dosto ke liye hai yeh app.
          </p>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl border border-red-200 mb-4">
              {error}
            </p>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm border-2 border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
          >
            {/* Google "G" logo */}
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {loading ? "Kholte hain..." : "Google se Login Karo"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">
          Sirf Hayan, Usman, Mubassir aur Hasnain ke liye
        </p>
      </div>
    </div>
  );
}
