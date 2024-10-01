import { PaginationParamsInterface } from "~/shared/pagination-params-interface";

export interface IncomeLoaderParamsInterface extends PaginationParamsInterface {
  name: string | null;
  is_personal_or_company: "personal" | "company" | "all";
  amount_greater: number | null;
  amount_less: number | null;
  company: string | null;
}
