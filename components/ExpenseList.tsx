"use client";

import React from "react";
import { Expense } from "@/lib/types";
import { EditIcon, TrashIcon } from "./Icons";

interface Props {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export default function ExpenseList({ expenses, onEdit, onDelete }: Props) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="5" y="3" width="22" height="26" rx="2" stroke="#D1D5DB" strokeWidth="2" />
            <line x1="10" y1="10" x2="22" y2="10" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
            <line x1="10" y1="15" x2="22" y2="15" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
            <line x1="10" y1="20" x2="17" y2="20" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sm font-medium">Abhi kuch nahi</p>
        <p className="text-xs mt-1">Pehla kharcha daal do</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => {
        const perHead =
          expense.split_type === "equal" && expense.participants.length > 0
            ? expense.amount / expense.participants.length
            : null;

        return (
          <div key={expense.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{expense.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">{expense.created_at?.split("T")[0]}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-gray-800 text-base">Rs. {expense.amount.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  <span className="font-medium text-teal-600">{expense.paid_by}</span> ne diya
                </span>
                <span>{expense.participants.join(", ")}</span>
              </div>

              {expense.split_type === "equal" && perHead && (
                <p className="text-xs text-gray-400 mt-1">
                  Har banda: Rs. {perHead.toFixed(0)}
                </p>
              )}

              {expense.split_type === "custom" && expense.custom_split && (
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                  {expense.participants.map((p) => (
                    <span key={p} className="text-xs text-gray-400">
                      {p}: Rs. {(expense.custom_split?.[p] ?? 0).toFixed(0)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onEdit(expense)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-teal-50 hover:text-teal-700 transition-all"
              >
                <EditIcon size={13} />
                Edit
              </button>
              <button
                onClick={() => onDelete(expense.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-red-50 hover:text-red-600 transition-all"
              >
                <TrashIcon size={13} />
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
