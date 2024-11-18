import {
  IsIncomeOrExpenseType,
  IsPersonalOrCompanyType,
} from "~/shared/shared-types";

export interface WhereParamsInterface {
  name?: string;
  company?: string;
  has_company?: string;
  is_personal_or_company?: IsPersonalOrCompanyType;
  is_income_or_expense?: IsIncomeOrExpenseType;
  amount_greater?: number;
  amount_less?: number;
}
