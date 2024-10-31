import { PaginationParamsInterface } from "~/shared/pagination-params-interface";

export interface CompanyLoaderParamsInterface
  extends PaginationParamsInterface {
  name: string | undefined;
}
