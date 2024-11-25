import { PaginationParamsInterface } from "~/shared/pagination-params-interface";
import { IsPersonalOrCompanyType } from "~/shared/shared-types";
import { IncomeIncludeOptions } from "~/data/income/income-types";

export interface IncomeLoaderParamsInterface extends PaginationParamsInterface {
  name: string | undefined;
  is_personal_or_company: IsPersonalOrCompanyType;
  amount_greater: number | undefined;
  amount_less: number | undefined;
  has_company: string | undefined;
  extends?: IncomeIncludeOptions[];
}
