import PaginationParamsInterface from "~/shared/pagination-params-interface";

export default interface CompanyLoaderParamsInterface extends PaginationParamsInterface {
  name: string | null;
  working_capital_greater: number;
  working_capital_less: number;
  with_accounts: boolean;
}
