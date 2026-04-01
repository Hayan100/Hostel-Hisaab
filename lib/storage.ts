import { Expense } from "./types";

const KEY = "hostel_hisaab_expenses";

export function loadExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(expenses));
}

export function clearExpenses(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
