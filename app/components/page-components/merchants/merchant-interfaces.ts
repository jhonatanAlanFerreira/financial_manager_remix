import { Merchant } from "@prisma/client";
import { BasePageStoreInterface } from "~/shared/base-page-store-interface";
import { ServerResponseInterface } from "~/shared/server-response-interface";

export interface MerchantFiltersFormInterface {
  name: string;
}

export interface MerchantFormInterface {
  id: string;
  name: string;
}

export interface MerchantStoreInterface extends BasePageStoreInterface {
  merchants: ServerResponseInterface<Merchant[]>;
  setMerchants: (value: ServerResponseInterface<Merchant[]>) => void;
}
