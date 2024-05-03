import { Company } from "@prisma/client";

export interface ClassificationForm {
  id: string;
  name: string;
  companies: Company[];
  is_personal_transaction_classification: boolean;
  is_income: boolean;
}
