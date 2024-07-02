import PaginationParams from "~/interfaces/queryParams/PaginationParams";

export default interface IncomeLoaderParams extends PaginationParams {
  name: string | null;
  is_personal_or_company: "personal" | "company" | "all";
  amount_greater: number | null;
  amount_less: number | null;
  company: string | null;
}
