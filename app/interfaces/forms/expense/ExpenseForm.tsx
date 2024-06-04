import { Company } from "@prisma/client";

export interface ExpenseForm {
  id: string;
  name: string;
  amount: number | null;
  companies: Company[];
  is_personal_expense: boolean;
}
