import { create } from "zustand";
import { TransactionStoreInterface } from "~/components/page-components/transaction/transaction-interfaces";
import { createBasePageStore } from "~/utils/utilities";

export const transactionStore = create<TransactionStoreInterface>(
  (set, get) => ({
    ...createBasePageStore(set, get),
    totalExpenseValue: 0,
    setTotalExpenseValue: (value) => set({ totalExpenseValue: value }),
    totalIncomeValue: 0,
    setTotalIncomeValue: (value) => set({ totalIncomeValue: value }),
    transactions: {},
    setTransactions: (value) => set({ transactions: value }),
  })
);
