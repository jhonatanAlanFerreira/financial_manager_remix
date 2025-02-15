import { PaginationParamsInterface } from "~/shared/pagination-params-interface";
import {
  IsIncomeOrExpenseType,
  IsPersonalOrCompanyType,
} from "~/shared/shared-types";
import { TransactionIncludeOptions } from "~/data/transaction/transaction-types";
import { SortParamsInterface } from "~/shared/sort-params-interface";

export interface TransactionLoaderParamsInterface
  extends PaginationParamsInterface,
    SortParamsInterface {
  name: string | undefined;
  is_personal_or_company: IsPersonalOrCompanyType;
  is_income_or_expense: IsIncomeOrExpenseType;
  date_after: string | undefined;
  date_before: string | undefined;
  amount_greater: number | undefined;
  amount_less: number | undefined;
  income: string | undefined;
  expense: string | undefined;
  company: string | undefined;
  account: string | undefined;
  merchant: string | undefined;
  has_classification: string | undefined;
  extends?: TransactionIncludeOptions[];
}
