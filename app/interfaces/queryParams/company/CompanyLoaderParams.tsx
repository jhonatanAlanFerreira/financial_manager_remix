import PaginationParams from "~/interfaces/queryParams/PaginationParams";

export default interface CompanyLoaderParams extends PaginationParams {
  name: string | null;
  working_capital_greater: number;
  working_capital_less: number;
  with_accounts: boolean;
}
