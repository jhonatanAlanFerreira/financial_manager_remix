import { PaginationParamsInterface } from "~/shared/pagination-params-interface";
import { CompanyIncludeOptions } from "~/data/company/company-types";

export interface CompanyLoaderParamsInterface
  extends PaginationParamsInterface {
  name?: string | undefined;
  extends?: CompanyIncludeOptions[];
}
