import { Company } from "@prisma/client";
import {
  IsIncomeOrExpenseType,
  IsPersonalOrCompanyType,
} from "~/shared/shared-types";

export interface ClassificationFiltersFormInterface {
  name: string;
  has_company: Company | null;
  is_personal_or_company: IsPersonalOrCompanyType;
  is_income_or_expense: IsIncomeOrExpenseType;
}

export interface ClassificationFormInterface {
  id: string;
  name: string;
  companies: Company[];
  is_personal: boolean;
  is_income: boolean;
}
