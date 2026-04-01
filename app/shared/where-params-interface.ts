import {
  IsIncomeOrExpenseType,
  IsPersonalOrCompanyType,
} from "~/shared/shared-types";

export interface WhereParamsInterface {
  name?: string;
  company?: string;
  income?: string;
  expense?: string;
  merchant?: string;
  account?: string;
  classification?: string;
  has_company?: string;
  has_classification?: string;
  date_after?: string;
  date_before?: string;
  is_personal_or_company?: IsPersonalOrCompanyType;
  is_income_or_expense?: IsIncomeOrExpenseType;
  amount_greater?: number;
  amount_less?: number;
}
