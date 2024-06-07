import { Company, Expense, Income } from "@prisma/client";

export interface TransactionFiltersForm {
  name: string;
  is_personal_transaction: boolean;
  is_income_transaction: boolean;
  company: Company | null;
  expense: Expense | null;
  income: Income | null;
  date_after: string;
  date_before: string;
  amount_greater: number;
  amount_less: number;
}
