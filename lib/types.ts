export type Person = "Hayan" | "Usman" | "Mubassir" | "Hasnain";

export const PEOPLE: Person[] = ["Hayan", "Usman", "Mubassir", "Hasnain"];

export type SplitType = "equal" | "custom";

export interface CustomSplit {
  [person: string]: number;
}

export interface Expense {
  id: string;
  session_id: string;
  paid_by: Person;
  amount: number;
  description: string;
  participants: Person[];
  split_type: SplitType;
  custom_split?: CustomSplit;
  created_at: string;
}

export interface Session {
  id: string;
  status: "active" | "settled";
  created_at: string;
  settled_at: string | null;
}

export interface Settlement {
  from: Person;
  to: Person;
  amount: number;
}

export interface DbSettlement {
  id: string;
  session_id: string;
  from_person: Person;
  to_person: Person;
  amount: number;
  created_at: string;
}

export interface Profile {
  id: string;
  name: Person;
}
