import { ExpenseStoreInterface } from "~/components/page-components/expense/expense-interfaces";
import { create } from "zustand";
import { createBasePageStore } from "~/utils/utilities";

export const expenseStore = create<ExpenseStoreInterface>((set, get) => ({
  ...createBasePageStore(set, get),
  companies: {},
  setCompanies: (value) => set({ companies: value }),
  expenses: {},
  setExpenses: (value) => set({ expenses: value }),
}));
