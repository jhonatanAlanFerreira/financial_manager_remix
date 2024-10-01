import { PaginationParamsInterface } from "~/shared/pagination-params-interface";

export interface CompanyLoaderParamsInterface extends PaginationParamsInterface {
  name: string | null;
  working_capital_greater: number;
  working_capital_less: number;
  with_accounts: boolean;
}
