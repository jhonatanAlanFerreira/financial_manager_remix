import { Company } from "@prisma/client";

export default interface ExpenseFiltersForm {
  name: string;
  amount_greater: number;
  amount_less: number;
  company: Company | null;
  is_personal_or_company: "personal" | "company" | "all";
}
