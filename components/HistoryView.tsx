"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Session, Expense, DbSettlement, Person } from "@/lib/types";
import { DownloadIcon, ArrowRightIcon } from "./Icons";

interface SessionData {
  session: Session;
  expenses: Expense[];
  settlements: DbSettlement[];
}

export default function HistoryView() {
  const [history, setHistory] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    const supabase = createClient();
    const { data: sessions } = await supabase
      .from("sessions")
      .select("*")
      .eq("status", "settled")
      .order("settled_at", { ascending: false });

    if (!sessions || sessions.length === 0) {
      setLoading(false);
      return;
    }

    const results: SessionData[] = [];
    for (const session of sessions) {
      const [{ data: expenses }, { data: settlements }] = await Promise.all([
        supabase.from("expenses").select("*").eq("session_id", session.id).order("created_at"),
        supabase.from("settlements").select("*").eq("session_id", session.id),
      ]);
      results.push({
        session,
        expenses: (expenses ?? []) as Expense[],
        settlements: (settlements ?? []) as DbSettlement[],
      });
    }

    setHistory(results);
    setLoading(false);
  }

  async function exportSession(data: SessionData) {
    setExporting(data.session.id);
    try {
      const jsPDF = (await import("jspdf")).default;
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = pdf.internal.pageSize.getWidth();
      const startDate = new Date(data.session.created_at).toLocaleDateString("en-PK");
      const endDate = data.session.settled_at
        ? new Date(data.session.settled_at).toLocaleDateString("en-PK")
        : "";
      let y = 0;

      pdf.setFillColor(13, 148, 136);
      pdf.rect(0, 0, W, 22, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Hostel Hisaab", 10, 13);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text(`${startDate} — ${endDate}`, W - 10, 13, { align: "right" });
      y = 32;

      const totalSpent = data.expenses.reduce((s, e) => s + e.amount, 0);

      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.text("AYASHI KA RECORD", 10, y);
      y += 5;
      pdf.setDrawColor(220, 220, 220);
      pdf.line(10, y, W - 10, y);
      y += 5;

      for (const e of data.expenses) {
        pdf.setTextColor(40, 40, 40);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.text(e.description, 10, y);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(100, 100, 100);
        pdf.text(`${e.paid_by} - ${e.participants.join(", ")}`, 10, y + 4);
        pdf.setTextColor(40, 40, 40);
        pdf.setFont("helvetica", "bold");
        pdf.text(`Rs. ${e.amount.toLocaleString()}`, W - 10, y, { align: "right" });
        y += 10;
        if (y > 260) { pdf.addPage(); y = 15; }
      }

      pdf.setDrawColor(180, 180, 180);
      pdf.setLineDashPattern([2, 2], 0);
      pdf.line(10, y, W - 10, y);
      pdf.setLineDashPattern([], 0);
      y += 5;
      pdf.setTextColor(40, 40, 40);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("Total", 10, y);
      pdf.text(`Rs. ${totalSpent.toLocaleString()}`, W - 10, y, { align: "right" });
      y += 12;

      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.text("SETTLEMENT", 10, y);
      y += 5;
      pdf.setDrawColor(220, 220, 220);
      pdf.line(10, y, W - 10, y);
      y += 5;

      if (data.settlements.length === 0) {
        pdf.setTextColor(22, 163, 74);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text("Sab barabar the", 10, y);
      } else {
        for (const s of data.settlements) {
          pdf.setFillColor(245, 245, 245);
          pdf.roundedRect(10, y - 4, W - 20, 10, 2, 2, "F");
          pdf.setTextColor(220, 38, 38);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(9);
          pdf.text(s.from_person, 13, y + 2);
          const fw = pdf.getTextWidth(s.from_person);
          pdf.setTextColor(120, 120, 120);
          pdf.setFont("helvetica", "normal");
          pdf.text(" -> ", 13 + fw, y + 2);
          const aw = pdf.getTextWidth(" -> ");
          pdf.setTextColor(22, 163, 74);
          pdf.setFont("helvetica", "bold");
          pdf.text(s.to_person, 13 + fw + aw, y + 2);
          pdf.setTextColor(40, 40, 40);
          pdf.text(`Rs. ${s.amount.toLocaleString()}`, W - 13, y + 2, { align: "right" });
          y += 12;
          if (y > 260) { pdf.addPage(); y = 15; }
        }
      }

      pdf.save(`hisaab-${startDate.replace(/\//g, "-")}.pdf`);
    } catch (err) {
      console.error(err);
    }
    setExporting(null);
  }

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-sm">Load ho raha hai...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="12" stroke="#D1D5DB" strokeWidth="2" />
            <line x1="16" y1="9" x2="16" y2="16" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="16" x2="21" y2="20" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sm font-medium">Abhi koi purana hisaab nahi</p>
        <p className="text-xs mt-1">Jab hisaab band hoga, yahan dikhega</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((data, index) => {
        const totalSpent = data.expenses.reduce((s, e) => s + e.amount, 0);
        const startDate = new Date(data.session.created_at).toLocaleDateString("en-PK");
        const endDate = data.session.settled_at
          ? new Date(data.session.settled_at).toLocaleDateString("en-PK")
          : "";
        const isOpen = expanded === data.session.id;

        return (
          <div key={data.session.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header row */}
            <button
              onClick={() => setExpanded(isOpen ? null : data.session.id)}
              className="w-full px-4 py-4 flex items-center justify-between text-left"
            >
              <div>
                <p className="text-sm font-bold text-gray-800">
                  Session {history.length - index}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{startDate} — {endDate}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">Rs. {totalSpent.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{data.expenses.length} entries</p>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                >
                  <polyline points="3,6 8,11 13,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-gray-100">
                {/* Expenses */}
                <div className="p-4 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Kharche</p>
                  <div className="space-y-2">
                    {data.expenses.map((e) => (
                      <div key={e.id} className="flex justify-between text-sm">
                        <div className="flex-1 min-w-0 pr-3">
                          <span className="text-gray-700 font-medium truncate block">{e.description}</span>
                          <span className="text-gray-400 text-xs">{e.paid_by} — {e.participants.join(", ")}</span>
                        </div>
                        <span className="font-semibold text-gray-800 shrink-0">Rs. {e.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Settlements */}
                <div className="p-4 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Settlement</p>
                  {data.settlements.length === 0 ? (
                    <p className="text-sm text-green-600">Sab barabar the</p>
                  ) : (
                    <div className="space-y-2">
                      {data.settlements.map((s) => (
                        <div key={s.id} className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-red-500">{s.from_person}</span>
                          <ArrowRightIcon size={13} className="text-gray-400" />
                          <span className="font-semibold text-green-600">{s.to_person}</span>
                          <span className="ml-auto font-bold text-gray-700">Rs. {s.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Download */}
                <div className="p-4">
                  <button
                    onClick={() => exportSession(data)}
                    disabled={exporting === data.session.id}
                    className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  >
                    <DownloadIcon size={15} />
                    {exporting === data.session.id ? "Ban raha hai..." : "PDF Banao"}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
