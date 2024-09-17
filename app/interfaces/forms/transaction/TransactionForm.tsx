import {
  Account,
  Company,
  Expense,
  Income,
  TransactionClassification,
} from "@prisma/client";

export interface TransactionForm {
  id: string;
  transaction_date: string;
  amount: number;
  is_personal_transaction: boolean;
  is_income: boolean;
  classifications: TransactionClassification[];
  income: Income | null;
  company: Company | null;
  expense: Expense | null;
  account: Account | null;
  name: string;
}
