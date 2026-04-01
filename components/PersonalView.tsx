"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Expense, Profile } from "@/lib/types";
import { PlusIcon, TrashIcon } from "./Icons";

interface PersonalExpense {
  id: string;
  description: string;
  amount: number;
  created_at: string;
  type: "private";
}

interface SharedEntry {
  id: string;
  description: string;
  amount: number; // this person's share
  created_at: string;
  type: "shared";
  session_label: string;
}

type FeedEntry = PersonalExpense | SharedEntry;

interface Props {
  profile: Profile;
}

export default function PersonalView({ profile }: Props) {
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  useEffect(() => {
    loadFeed();
  }, [profile]);

  async function loadFeed() {
    setLoading(true);
    try {
      // Load all shared expenses
      const { data: allExpenses } = await supabase
        .from("expenses")
        .select("*")
        .order("created_at", { ascending: false });

      // Load private personal expenses
      const { data: privateExpenses } = await supabase
        .from("personal_expenses")
        .select("*")
        .order("created_at", { ascending: false });

      const sharedEntries: SharedEntry[] = [];

      for (const e of (allExpenses ?? []) as Expense[]) {
        if (!e.participants.includes(profile.name)) continue;

        let myShare = 0;
        if (e.split_type === "equal") {
          myShare = e.amount / e.participants.length;
        } else if (e.split_type === "custom" && e.custom_split) {
          myShare = e.custom_split[profile.name] ?? 0;
        }

        if (myShare <= 0) continue;

        sharedEntries.push({
          id: e.id,
          description: e.description,
          amount: myShare,
          created_at: e.created_at,
          type: "shared",
          session_label: e.paid_by === profile.name ? "Maine diya" : `${e.paid_by} ne diya`,
        });
      }

      const privateEntries: PersonalExpense[] = (privateExpenses ?? []).map((p: PersonalExpense) => ({
        ...p,
        type: "private" as const,
      }));

      const combined: FeedEntry[] = [...sharedEntries, ...privateEntries].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setFeed(combined);
    } catch (err) {
      console.error("PersonalView loadFeed error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPrivate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const amt = parseFloat(amount);
    if (!desc.trim()) { setError("Description likhna zaroori hai."); return; }
    if (!amt || amt <= 0) { setError("Amount sahi daal."); return; }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    await supabase.from("personal_expenses").insert({
      user_id: user.id,
      description: desc.trim(),
      amount: amt,
    });

    setDesc("");
    setAmount("");
    setShowForm(false);
    setSaving(false);
    await loadFeed();
  }

  async function handleDeletePrivate(id: string) {
    await supabase.from("personal_expenses").delete().eq("id", id);
    setFeed((prev) => prev.filter((e) => e.id !== id));
  }

  const total = feed.reduce((s, e) => s + e.amount, 0);
  const sharedTotal = feed.filter((e) => e.type === "shared").reduce((s, e) => s + e.amount, 0);
  const privateTotal = feed.filter((e) => e.type === "private").reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
        <p className="text-xs text-teal-700 font-medium mb-1">Tera Kul Kharcha</p>
        <p className="text-2xl font-bold text-teal-800">Rs. {total.toLocaleString()}</p>
        <div className="flex gap-4 mt-2">
          <div>
            <p className="text-xs text-teal-600">Shared se</p>
            <p className="text-sm font-semibold text-teal-800">Rs. {sharedTotal.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-xs text-teal-600">Personal</p>
            <p className="text-sm font-semibold text-teal-800">Rs. {privateTotal.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Add private expense button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 rounded-xl border-2 border-dashed border-teal-300 text-teal-600 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-teal-50 transition-all"
        >
          <PlusIcon size={16} />
          Private Kharcha Add Karo
        </button>
      )}

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAddPrivate} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
          <p className="text-sm font-bold text-gray-700">Private Kharcha</p>
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Kiya khareeda / kiya kiya?"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-gray-800 focus:outline-none focus:border-teal-400 text-sm"
          />
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rs.</span>
            <input
              type="number"
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-gray-800 focus:outline-none focus:border-teal-400 text-sm"
            />
          </div>
          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-200">{error}</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setDesc(""); setAmount(""); setError(""); }}
              className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold disabled:opacity-60"
            >
              {saving ? "Ho raha hai..." : "Save Karo"}
            </button>
          </div>
        </form>
      )}

      {/* Feed */}
      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Load ho raha hai...</div>
      ) : feed.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm font-medium">Abhi kuch nahi</p>
          <p className="text-xs mt-1">Shared ya private kharcha add karo</p>
        </div>
      ) : (
        <div className="space-y-2">
          {feed.map((entry) => (
            <div key={`${entry.type}-${entry.id}`} className="bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm flex items-center gap-3">
              {/* Type indicator */}
              <div className={`w-2 h-2 rounded-full shrink-0 ${entry.type === "shared" ? "bg-teal-400" : "bg-gray-400"}`} />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{entry.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {entry.type === "shared"
                    ? `Shared — ${(entry as SharedEntry).session_label}`
                    : "Personal"}
                  {" · "}
                  {entry.created_at?.split("T")[0]}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-bold text-gray-800">
                  Rs. {Math.round(entry.amount).toLocaleString()}
                </span>
                {entry.type === "private" && (
                  <button
                    onClick={() => handleDeletePrivate(entry.id)}
                    className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <TrashIcon size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      {feed.length > 0 && (
        <div className="flex items-center gap-4 px-1 pb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-teal-400" />
            <span className="text-xs text-gray-400">Shared kharcha (tera hissa)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-xs text-gray-400">Personal</span>
          </div>
        </div>
      )}
    </div>
  );
}
