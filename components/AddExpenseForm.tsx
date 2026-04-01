"use client";

import React, { useState, useEffect } from "react";
import { Expense, Person, PEOPLE, SplitType, CustomSplit } from "@/lib/types";
import { PlusIcon } from "./Icons";

interface Props {
  onSave: (expense: Omit<Expense, "id" | "session_id" | "created_at">) => void;
  editingExpense?: Expense | null;
  onCancelEdit?: () => void;
}

const emptyCustomSplit = (): CustomSplit =>
  Object.fromEntries(PEOPLE.map((p) => [p, 0]));

const othersOf = (payer: Person): Person[] => PEOPLE.filter((p) => p !== payer);

export default function AddExpenseForm({ onSave, editingExpense, onCancelEdit }: Props) {
  const [paidBy, setPaidBy] = useState<Person>("Hayan");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [participants, setParticipants] = useState<Person[]>(othersOf("Hayan"));
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [customSplit, setCustomSplit] = useState<CustomSplit>(emptyCustomSplit());
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingExpense) {
      setPaidBy(editingExpense.paid_by);
      setAmount(String(editingExpense.amount));
      setDescription(editingExpense.description);
      setParticipants(editingExpense.participants.filter((p) => p !== editingExpense.paid_by));
      setSplitType(editingExpense.split_type);
      setCustomSplit(editingExpense.custom_split ?? emptyCustomSplit());
    }
  }, [editingExpense]);

  function handlePaidByChange(p: Person) {
    setPaidBy(p);
    setParticipants((prev) => prev.filter((x) => x !== p));
  }

  function toggleParticipant(p: Person) {
    setParticipants((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  function handleCustomSplitChange(p: Person, val: string) {
    setCustomSplit((prev) => ({ ...prev, [p]: parseFloat(val) || 0 }));
  }

  const totalAmount = parseFloat(amount) || 0;
  // payer is always a participant — included in all splits
  const allParticipants: Person[] = [...participants, paidBy];
  const customTotal = allParticipants.reduce((s, p) => s + (customSplit[p] ?? 0), 0);
  const equalShare = allParticipants.length > 0 ? totalAmount / allParticipants.length : 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!amount || isNaN(totalAmount) || totalAmount <= 0) {
      setError("Amount sahi daal bhai.");
      return;
    }
    if (splitType === "custom") {
      const diff = Math.abs(customTotal - totalAmount);
      if (diff > 0.5) {
        setError(`Custom split ka total ${customTotal.toFixed(0)} hai, amount ${totalAmount.toFixed(0)} — match nahi kar raha.`);
        return;
      }
    }

    onSave({
      paid_by: paidBy,
      amount: totalAmount,
      description: description.trim() || "Koi baat nahi",
      participants: allParticipants, // payer always included
      split_type: splitType,
      custom_split: splitType === "custom" ? customSplit : undefined,
    });

    resetForm();
  }

  function resetForm() {
    setPaidBy("Hayan");
    setAmount("");
    setDescription("");
    setParticipants(othersOf("Hayan"));
    setSplitType("equal");
    setCustomSplit(emptyCustomSplit());
    setError("");
  }

  const availableParticipants = othersOf(paidBy);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Paid By */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Kisne pese diye?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PEOPLE.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePaidByChange(p)}
              className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                paidBy === p
                  ? "border-teal-500 bg-teal-50 text-teal-800"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Kitne pese diye?
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">Rs.</span>
          <input
            type="number"
            min="1"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-800 focus:outline-none focus:border-teal-400 text-base"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Kis cheez per kharch kiye?
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Dinner, chai, bill..."
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-teal-400"
        />
      </div>

      {/* Participants */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Muftkhron ko shamil karen
        </label>
        <div className="grid grid-cols-2 gap-2">
          {availableParticipants.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => toggleParticipant(p)}
              className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                participants.includes(p)
                  ? "border-teal-500 bg-teal-50 text-teal-800"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Split Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Kaise taqseem karen?
        </label>
        <div className="flex rounded-xl border-2 border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setSplitType("equal")}
            className={`flex-1 py-2.5 text-sm font-medium transition-all ${
              splitType === "equal" ? "bg-teal-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Barabar
          </button>
          <button
            type="button"
            onClick={() => setSplitType("custom")}
            className={`flex-1 py-2.5 text-sm font-medium transition-all border-l-2 border-gray-200 ${
              splitType === "custom" ? "bg-teal-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {splitType === "equal" && totalAmount > 0 && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
          <p className="text-sm text-teal-800 font-medium">
            Har banda dega: <span className="font-bold">Rs. {equalShare.toFixed(0)}</span>
          </p>
          <p className="text-xs text-teal-600 mt-0.5">
            {allParticipants.join(", ")}
          </p>
        </div>
      )}

      {splitType === "custom" && (
        <div className="space-y-2">
          {/* Payer's own share field */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-teal-700 w-20">{paidBy} <span className="text-xs">(dene wala)</span></span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rs.</span>
              <input
                type="number"
                min="0"
                step="any"
                value={customSplit[paidBy] || ""}
                onChange={(e) => handleCustomSplitChange(paidBy, e.target.value)}
                placeholder="0"
                className="w-full border-2 border-teal-200 rounded-xl pl-10 pr-4 py-2.5 text-gray-800 focus:outline-none focus:border-teal-400 text-sm"
              />
            </div>
          </div>
          {participants.map((p) => (
            <div key={p} className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 w-20">{p}</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rs.</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={customSplit[p] || ""}
                  onChange={(e) => handleCustomSplitChange(p, e.target.value)}
                  placeholder="0"
                  className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-gray-800 focus:outline-none focus:border-teal-400 text-sm"
                />
              </div>
            </div>
          ))}
          <div className={`text-sm font-medium mt-1 ${Math.abs(customTotal - totalAmount) > 0.5 ? "text-red-500" : "text-green-600"}`}>
            Total: Rs. {customTotal.toFixed(0)} / Rs. {totalAmount.toFixed(0)}
          </div>
        </div>
      )}


      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl border border-red-200">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        {editingExpense && (
          <button
            type="button"
            onClick={() => { resetForm(); onCancelEdit?.(); }}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
        >
          <PlusIcon size={16} />
          {editingExpense ? "Update Karo" : "Khate me liklo"}
        </button>
      </div>
    </form>
  );
}
