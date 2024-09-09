import { Company } from "@prisma/client";

export interface IncomeForm {
  id: string;
  name: string;
  amount: number | null;
  companies: Company[];
  is_personal_income: boolean;
}
