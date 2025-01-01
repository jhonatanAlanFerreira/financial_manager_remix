import { PaginationParamsInterface } from "~/shared/pagination-params-interface";
import { MerchantIncludeOptions } from "~/data/merchant/merchant-types";

export interface MerchantLoaderParamsInterface
  extends PaginationParamsInterface {
  name: string | undefined;
  extends?: MerchantIncludeOptions[];
}
