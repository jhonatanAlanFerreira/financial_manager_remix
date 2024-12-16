import { Company } from "@prisma/client";

export interface ClassificationFiltersFormInterface {
  name: string;
  has_company: Company | null;
  is_personal_or_company: "personal" | "company" | "all";
  is_income_or_expense: "income" | "expense" | "all";
}

export interface ClassificationFormInterface {
  id: string;
  name: string;
  companies: Company[];
  is_personal: boolean;
  is_income: boolean;
}
