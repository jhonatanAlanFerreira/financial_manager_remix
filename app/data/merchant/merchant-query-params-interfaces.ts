import { PaginationParamsInterface } from "~/shared/pagination-params-interface";
import { MerchantIncludeOptions } from "~/data/merchant/merchant-types";
import { SortParamsInterface } from "~/shared/sort-params-interface";

export interface MerchantLoaderParamsInterface
  extends PaginationParamsInterface,
    SortParamsInterface {
  name: string | undefined;
  extends?: MerchantIncludeOptions[];
}
