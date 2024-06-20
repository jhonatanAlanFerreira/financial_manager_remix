import { Company } from "@prisma/client";

export default interface ClassificationFiltersForm {
  name: string;
  company: Company | null;
  is_personal_transaction_classification: boolean;
  is_income: boolean;
}
