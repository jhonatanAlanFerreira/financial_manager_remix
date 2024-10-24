import { PaginationParamsInterface } from "~/shared/pagination-params-interface";
import { IsPersonalOrCompanyType } from "~/shared/shared-types";

export interface AccountLoaderParamsInterface
  extends PaginationParamsInterface {
  name: string | undefined;
  company: string | undefined;
  is_personal_or_company: IsPersonalOrCompanyType;
}
