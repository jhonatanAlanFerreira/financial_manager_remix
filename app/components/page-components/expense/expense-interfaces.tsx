import { Company } from "@prisma/client";

export interface ExpenseFiltersFormInterface {
  name: string;
  amount_greater: number;
  amount_less: number;
  has_company: Company | null;
  is_personal_or_company: "personal" | "company" | "all";
}

export interface ExpenseFormInterface {
  id: string;
  name: string;
  amount: number | null;
  companies: Company[];
  is_personal: boolean;
}
