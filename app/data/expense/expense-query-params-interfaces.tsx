import { PaginationParamsInterface } from "~/shared/pagination-params-interface";
import { IsPersonalOrCompanyType } from "~/shared/shared-types";
import { ExpenseIncludeOptions } from "~/data/expense/expense-types";

export interface ExpenseLoaderParamsInterface
  extends PaginationParamsInterface {
  name: string | undefined;
  is_personal_or_company: IsPersonalOrCompanyType;
  amount_greater: number | undefined;
  amount_less: number | undefined;
  has_company: string | undefined;
  extends?: ExpenseIncludeOptions[];
}
