import { Company } from "@prisma/client";

export interface IncomeFiltersFormInterface {
  name: string;
  amount_greater: number;
  amount_less: number;
  company: Company | null;
  is_personal_or_company: "personal" | "company" | "all";
}

export interface IncomeFormInterface {
  id: string;
  name: string;
  amount: number | null;
  companies: Company[];
  is_personal: boolean;
}
