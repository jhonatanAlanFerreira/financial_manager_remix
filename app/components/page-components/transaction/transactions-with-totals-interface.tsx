import { Transaction } from "@prisma/client";

export default interface TransactionsWithTotalsInterface {
  transactions: Transaction[];
  totalIncomeValue: number;
  totalExpenseValue: number;
}
