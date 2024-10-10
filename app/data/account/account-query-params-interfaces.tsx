import { PaginationParamsInterface } from "~/shared/pagination-params-interface";

export interface AccountLoaderParamsInterface
  extends PaginationParamsInterface {
  name: string | null;
  company: string | null;
  is_personal_or_company: "personal" | "company" | "all";
}
