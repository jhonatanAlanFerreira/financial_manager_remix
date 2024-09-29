import PaginationParamsInterface from "~/shared/pagination-params-interface";

export default interface ClassificationLoaderParamsInterface extends PaginationParamsInterface {
  name: string | null;
  company: string | null;
  is_personal_or_company: "personal" | "company" | "all";
  is_income_or_expense: "income" | "expense" | "all";
}
