import { PaginationParamsInterface } from "~/shared/pagination-params-interface";
import {
  IsIncomeOrExpenseType,
  IsPersonalOrCompanyType,
} from "~/shared/shared-types";
import { ClassificationIncludeOptions } from "~/data/classification/classification-types";
import { SortParamsInterface } from "~/shared/sort-params-interface";

export interface ClassificationLoaderParamsInterface
  extends PaginationParamsInterface,
    SortParamsInterface {
  name: string | undefined;
  has_company: string | undefined;
  is_personal_or_company: IsPersonalOrCompanyType;
  is_income_or_expense: IsIncomeOrExpenseType;
  extends?: ClassificationIncludeOptions[];
}
