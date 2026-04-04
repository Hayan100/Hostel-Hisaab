"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Expense, Session, Settlement } from "@/lib/types";
import AddExpenseForm from "@/components/AddExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import HisabKaro from "@/components/HisabKaro";
import HistoryView from "@/components/HistoryView";
import { PlusIcon, ListIcon, CalculatorIcon, LedgerIcon, HistoryIcon } from "@/components/Icons";

type Tab = "add" | "list" | "hisab" | "history";

export default function Home() {
  const [tab, setTab] = useState<Tab>("add");
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const loadExpenses = useCallback(async (sessionId: string) => {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    if (error) { console.error("loadExpenses:", error); return; }
    setExpenses((data ?? []) as Expense[]);
  }, [supabase]);

  useEffect(() => {
    async function init() {
      // Get existing active session or create one
      let { data: session, error: fetchErr } = await supabase
        .from("sessions")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchErr) {
        setError("Database se connect nahi ho raha. Supabase setup check karo.");
        setMounted(true);
        return;
      }

      if (!session) {
        const { data: newSession, error: createErr } = await supabase
          .from("sessions")
          .insert({ status: "active" })
          .select()
          .single();

        if (createErr || !newSession) {
          setError("Naya session nahi ban raha: " + (createErr?.message ?? "unknown error"));
          setMounted(true);
          return;
        }
        session = newSession;
      }

      setActiveSession(session as Session);
      await loadExpenses(session.id);
      setMounted(true);

      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      }
    }
    init();
  }, []);

  // Real-time: reload expenses when any change happens in this session
  useEffect(() => {
    if (!activeSession) return;
    const channel = supabase
      .channel(`expenses:${activeSession.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses", filter: `session_id=eq.${activeSession.id}` },
        () => { loadExpenses(activeSession.id); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeSession?.id]);

  async function handleSave(expenseData: Omit<Expense, "id" | "session_id" | "created_at">): Promise<boolean> {
    if (!activeSession) return false;

    if (editingExpense) {
      const { error } = await supabase
        .from("expenses")
        .update({
          paid_by: expenseData.paid_by,
          amount: expenseData.amount,
          description: expenseData.description,
          participants: expenseData.participants,
          split_type: expenseData.split_type,
          custom_split: expenseData.custom_split ?? null,
        })
        .eq("id", editingExpense.id);
      if (error) { console.error("Update failed:", error); return false; }
      setEditingExpense(null);
    } else {
      const { error } = await supabase.from("expenses").insert({
        session_id: activeSession.id,
        paid_by: expenseData.paid_by,
        amount: expenseData.amount,
        description: expenseData.description,
        participants: expenseData.participants,
        split_type: expenseData.split_type,
        custom_split: expenseData.custom_split ?? null,
      });
      if (error) { console.error("Insert failed:", error); return false; }
    }

    await loadExpenses(activeSession.id);
    setTab("list");
    return true;
  }

  async function handleDelete(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) { console.error("Delete failed:", error); }
    if (activeSession) await loadExpenses(activeSession.id);
  }

  function handleEdit(expense: Expense) {
    setEditingExpense(expense);
    setTab("add");
  }

  async function handleSettle(settlements: Settlement[]) {
    if (!activeSession) return;

    if (settlements.length > 0) {
      await supabase.from("settlements").insert(
        settlements.map((s) => ({
          session_id: activeSession.id,
          from_person: s.from,
          to_person: s.to,
          amount: s.amount,
        }))
      );
    }

    await supabase
      .from("sessions")
      .update({ status: "settled", settled_at: new Date().toISOString() })
      .eq("id", activeSession.id);

    const { data: newSession } = await supabase
      .from("sessions")
      .insert({ status: "active" })
      .select()
      .single();

    if (newSession) {
      setActiveSession(newSession as Session);
      setExpenses([]);
      setTab("add");
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Load ho raha hai...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-100 text-center max-w-sm">
          <p className="text-red-500 font-semibold text-sm mb-2">Kuch gadbad ho gayi</p>
          <p className="text-gray-500 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="px-5 pt-10 pb-6">
        <div className="flex items-center gap-3">
          <LedgerIcon size={36} />
          <div>
            <h1 className="text-xl font-bold text-gray-800 leading-tight">Hostel Hisaab</h1>
            <p className="text-xs text-gray-400">Hayan · Usman · Mubassir · Hasnain</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {expenses.length > 0 && (
              <span className="bg-teal-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {expenses.length}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
              title="Logout"
            >
              Nikal Jao
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 pb-28 overflow-y-auto">
        {tab === "add" && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5">
              {editingExpense ? "Edit Karo" : "Kharcha Daal Do"}
            </h2>
            <AddExpenseForm
              onSave={handleSave}
              editingExpense={editingExpense}
              onCancelEdit={() => { setEditingExpense(null); setTab("list"); }}
            />
          </div>
        )}

        {tab === "list" && (
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-1">
              Ayashi ka Record
            </h2>
            <ExpenseList expenses={expenses} onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        )}

        {tab === "hisab" && (
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-1">
              Hisab Karo
            </h2>
            <HisabKaro expenses={expenses} onSettle={handleSettle} />
          </div>
        )}

        {tab === "history" && (
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-1">
              Purana Hisaab
            </h2>
            <HistoryView />
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-2 pb-safe">
        <div className="flex">
          {(
            [
              { id: "add",     label: "Daal Do",  Icon: PlusIcon },
              { id: "list",    label: "Ayashi",   Icon: ListIcon },
              { id: "hisab",   label: "Hisab",    Icon: CalculatorIcon },
              { id: "history", label: "History",  Icon: HistoryIcon },
            ] as { id: Tab; label: string; Icon: React.FC<{ size?: number; className?: string }> }[]
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => { setTab(id); if (id !== "add") setEditingExpense(null); }}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all relative ${
                tab === id ? "text-teal-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={22} />
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
              {tab === id && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-teal-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
