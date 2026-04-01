"use client";

import React, { useState } from "react";
import { Expense, Person, Settlement } from "@/lib/types";
import { computeNetBalances, simplifyDebts } from "@/lib/calculations";
import { DownloadIcon, RefreshIcon, ArrowRightIcon } from "./Icons";

interface Props {
  expenses: Expense[];
  onSettle: (settlements: Settlement[]) => Promise<void>;
}

export default function HisabKaro({ expenses, onSettle }: Props) {
  const [settled, setSettled] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [settling, setSettling] = useState(false);

  const balances = computeNetBalances(expenses);
  const settlements = simplifyDebts(balances);
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

  async function handleExport() {
    setExporting(true);
    try {
      const jsPDF = (await import("jspdf")).default;
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = pdf.internal.pageSize.getWidth();
      const date = new Date().toLocaleDateString("en-PK");
      let y = 0;

      pdf.setFillColor(13, 148, 136);
      pdf.rect(0, 0, W, 22, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Hostel Hisaab", 10, 13);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text(date, W - 10, 13, { align: "right" });
      y = 32;

      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.text("AYASHI KA RECORD", 10, y);
      y += 5;
      pdf.setDrawColor(220, 220, 220);
      pdf.line(10, y, W - 10, y);
      y += 5;

      for (const e of expenses) {
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
      pdf.text("NET BALANCE", 10, y);
      y += 5;
      pdf.setDrawColor(220, 220, 220);
      pdf.line(10, y, W - 10, y);
      y += 5;

      for (const [person, bal] of Object.entries(balances) as [Person, number][]) {
        pdf.setTextColor(40, 40, 40);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text(person, 10, y);
        const rounded = Math.round(bal);
        pdf.setTextColor(rounded >= 0 ? 22 : 220, rounded >= 0 ? 163 : 38, rounded >= 0 ? 74 : 38);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${rounded >= 0 ? "+" : ""}Rs. ${Math.abs(rounded).toLocaleString()}`, W - 10, y, { align: "right" });
        y += 7;
      }
      y += 5;

      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.text("KISE DENA HAI", 10, y);
      y += 5;
      pdf.setDrawColor(220, 220, 220);
      pdf.line(10, y, W - 10, y);
      y += 5;

      if (settlements.length === 0) {
        pdf.setTextColor(22, 163, 74);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.text("Sab barabar hain!", 10, y);
      } else {
        for (const s of settlements) {
          pdf.setFillColor(245, 245, 245);
          pdf.roundedRect(10, y - 4, W - 20, 10, 2, 2, "F");
          pdf.setTextColor(220, 38, 38);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(9);
          pdf.text(s.from, 13, y + 2);
          const fromW = pdf.getTextWidth(s.from);
          pdf.setTextColor(120, 120, 120);
          pdf.setFont("helvetica", "normal");
          pdf.text(" -> ", 13 + fromW, y + 2);
          const arrowW = pdf.getTextWidth(" -> ");
          pdf.setTextColor(22, 163, 74);
          pdf.setFont("helvetica", "bold");
          pdf.text(s.to, 13 + fromW + arrowW, y + 2);
          pdf.setTextColor(40, 40, 40);
          pdf.text(`Rs. ${s.amount.toLocaleString()}`, W - 13, y + 2, { align: "right" });
          y += 12;
          if (y > 260) { pdf.addPage(); y = 15; }
        }
      }

      pdf.save("hostel-hisaab.pdf");
    } catch (err) {
      console.error(err);
    }
    setExporting(false);
  }

  async function handleSettle() {
    setSettling(true);
    await onSettle(settlements);
    setSettling(false);
    setShowConfirm(false);
    setSettled(false);
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="4" width="24" height="24" rx="4" stroke="#D1D5DB" strokeWidth="2" />
            <line x1="10" y1="16" x2="22" y2="16" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="10" x2="16" y2="22" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sm font-medium">Pehle kharcha daal</p>
        <p className="text-xs mt-1">Hisab karne ke liye kuch toh hona chahiye</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-teal-50 border border-teal-200 rounded-2xl px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-teal-700 font-medium">Kul Kharcha</p>
          <p className="text-xl font-bold text-teal-800">Rs. {totalSpent.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-teal-700 font-medium">Entries</p>
          <p className="text-xl font-bold text-teal-800">{expenses.length}</p>
        </div>
      </div>

      {!settled && (
        <button
          onClick={() => setSettled(true)}
          className="w-full py-4 rounded-2xl bg-gray-800 hover:bg-gray-900 text-white font-bold text-base transition-all shadow-sm"
        >
          Hisab Karo
        </button>
      )}

      {settled && (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="bg-teal-600 px-4 py-3">
              <h2 className="text-white font-bold text-base">Hostel Hisaab</h2>
              <p className="text-teal-100 text-xs">{new Date().toLocaleDateString("en-PK")}</p>
            </div>

            {/* Expense list */}
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ayashi ka Record</h3>
              <div className="space-y-2">
                {expenses.map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-sm">
                    <div className="flex-1 min-w-0 pr-3">
                      <span className="text-gray-700 font-medium truncate block">{e.description}</span>
                      <span className="text-gray-400 text-xs">{e.paid_by} — {e.participants.join(", ")}</span>
                    </div>
                    <span className="font-semibold text-gray-800 shrink-0">Rs. {e.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t border-dashed border-gray-200 flex justify-between text-sm font-bold">
                <span className="text-gray-600">Total</span>
                <span className="text-gray-800">Rs. {totalSpent.toLocaleString()}</span>
              </div>
            </div>

            {/* Balances */}
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Net Balance</h3>
              <div className="space-y-2">
                {(Object.entries(balances) as [Person, number][]).map(([person, bal]) => (
                  <div key={person} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{person}</span>
                    <span className={`text-sm font-bold ${bal >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {bal >= 0 ? "+" : ""}Rs. {Math.abs(Math.round(bal)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Settlements */}
            <div className="p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Kise Dena Hai</h3>
              {settlements.length === 0 ? (
                <p className="text-sm text-green-600 font-medium">Sab barabar hain — kisi ka kuch nahi banta!</p>
              ) : (
                <div className="space-y-2">
                  {settlements.map((s, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                      <span className="font-semibold text-red-500 text-sm">{s.from}</span>
                      <ArrowRightIcon size={14} className="text-gray-400" />
                      <span className="font-semibold text-green-600 text-sm">{s.to}</span>
                      <span className="ml-auto font-bold text-gray-800 text-sm">Rs. {s.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              <DownloadIcon size={16} />
              {exporting ? "Ban raha hai..." : "PDF Banao"}
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="flex-1 py-3 rounded-xl border-2 border-red-200 text-red-500 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-50 transition-all"
            >
              <RefreshIcon size={16} />
              Naya Hisab
            </button>
          </div>
        </>
      )}

      {/* Settle confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50 p-4">
          <div className="bg-white rounded-2xl p-5 w-full shadow-xl">
            <h3 className="font-bold text-gray-800 text-base mb-1">Pakka Karo</h3>
            <p className="text-sm text-gray-500 mb-2">
              Yeh hisaab archive ho jayega aur naya session shuru hoga.
            </p>
            <p className="text-xs text-gray-400 mb-5">
              Pehle PDF zaroor le lo.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm"
              >
                Ruk Ja
              </button>
              <button
                onClick={handleSettle}
                disabled={settling}
                className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 transition-all disabled:opacity-60"
              >
                {settling ? "Ho raha hai..." : "Haan, Band Karo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
