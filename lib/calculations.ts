import { Expense, Person, PEOPLE, Settlement } from "./types";

export function computeNetBalances(expenses: Expense[]): Record<Person, number> {
  const balances: Record<Person, number> = {
    Hayan: 0,
    Usman: 0,
    Mubassir: 0,
    Hasnain: 0,
  };

  for (const expense of expenses) {
    balances[expense.paid_by] += expense.amount;

    // Always include the payer as a participant (handles old data where payer wasn't stored)
    const participants = [...new Set([...expense.participants, expense.paid_by])];

    if (expense.split_type === "equal") {
      const share = expense.amount / participants.length;
      for (const p of participants) {
        balances[p] -= share;
      }
    } else if (expense.split_type === "custom" && expense.custom_split) {
      for (const p of participants) {
        balances[p] -= expense.custom_split[p] ?? 0;
      }
    }
  }

  return balances;
}

export function simplifyDebts(balances: Record<Person, number>): Settlement[] {
  const bal = PEOPLE.map((p) => ({
    person: p,
    amount: Math.round(balances[p] * 100) / 100,
  }));

  const settlements: Settlement[] = [];

  for (let i = 0; i < bal.length * bal.length; i++) {
    const maxCreditor = bal.reduce((a, b) => (b.amount > a.amount ? b : a));
    const maxDebtor = bal.reduce((a, b) => (b.amount < a.amount ? b : a));

    if (Math.abs(maxCreditor.amount) < 0.01 || Math.abs(maxDebtor.amount) < 0.01) break;
    if (maxCreditor.amount <= 0 || maxDebtor.amount >= 0) break;

    const settled = Math.min(maxCreditor.amount, -maxDebtor.amount);
    const amount = Math.round(settled * 100) / 100;

    settlements.push({ from: maxDebtor.person, to: maxCreditor.person, amount });

    maxCreditor.amount -= amount;
    maxDebtor.amount += amount;
  }

  return settlements;
}
