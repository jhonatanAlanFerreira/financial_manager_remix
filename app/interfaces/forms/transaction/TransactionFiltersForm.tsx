import { Company, Expense, Income } from "@prisma/client";

export interface TransactionFiltersForm {
  name: string;
  is_personal_or_company: "personal" | "company" | "all";
  is_income_or_expense: "income" | "expense" | "all";
  company: Company | null;
  expense: Expense | null;
  income: Income | null;
  date_after: string;
  date_before: string;
  amount_greater: number;
  amount_less: number;
}
