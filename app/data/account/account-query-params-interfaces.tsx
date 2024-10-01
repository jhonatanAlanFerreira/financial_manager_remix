import { PaginationParamsInterface } from "~/shared/pagination-params-interface";

export interface AccountLoaderParamsInterface
  extends PaginationParamsInterface {
  name: string | null;
}
