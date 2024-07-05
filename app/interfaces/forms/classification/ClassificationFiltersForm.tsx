import { Company } from "@prisma/client";

export default interface ClassificationFiltersForm {
  name: string;
  company: Company | null;
  is_personal_or_company: "personal" | "company" | "all";
  is_income_or_expense: "income" | "expense" | "all";
}
