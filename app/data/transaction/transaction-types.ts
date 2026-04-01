import {
  Account,
  Company,
  Expense,
  Income,
  Merchant,
  Transaction,
  TransactionClassification,
} from "@prisma/client";

export interface TransactionWithRelationsInterface extends Transaction {
  company: Company;
  transaction_classifications: TransactionClassification[];
  expense: Expense;
  income: Income;
  account: Account;
  merchant: Merchant;
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
  "merchant",
] as const;
export type TransactionIncludeOptions =
  (typeof transactionIncludeOptions)[number];
