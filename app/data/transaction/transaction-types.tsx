import {
  Account,
  Company,
  Expense,
  Income,
  Transaction,
  TransactionClassification,
} from "@prisma/client";

export interface TransactionWithRelationsInterface extends Transaction {
  company: Company;
  transaction_classifications: TransactionClassification[];
  expense: Expense;
  income: Income;
  account: Account;
}

export interface TransactionsWithTotalsInterface {
  transactions: TransactionWithRelationsInterface[];
  totalExpenseValue: number;
  totalIncomeValue: number;
}

export const transactionIncludeOptions = [
  "company",
  "transaction_classifications",
  "expense",
  "income",
  "account",
] as const;
export type TransactionIncludeOptions =
  (typeof transactionIncludeOptions)[number];
