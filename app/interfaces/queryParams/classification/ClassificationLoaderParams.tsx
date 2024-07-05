import PaginationParams from "~/interfaces/queryParams/PaginationParams";

export default interface ClassificationLoaderParams extends PaginationParams {
  name: string | null;
  company: string | null;
  is_personal_or_company: "personal" | "company" | "all";
  is_income_or_expense: "income" | "expense" | "all";
}
