import { Transaction } from "@prisma/client";

export default interface TransactionsWithTotals {
  transactions: Transaction[];
  totalIncomeValue: number;
  totalExpenseValue: number;
}
