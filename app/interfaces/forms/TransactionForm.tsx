import { Company, Expense, Income, Transaction } from "@prisma/client";

export interface TransactionForm {
  id: string;
  transaction_date: string;
  amount: number;
  is_personal_transaction: boolean;
  is_income: boolean;
  classifications: Transaction[];
  income: Income | null;
  company: Company | null;
  expense: Expense | null;
  name: string;
}
