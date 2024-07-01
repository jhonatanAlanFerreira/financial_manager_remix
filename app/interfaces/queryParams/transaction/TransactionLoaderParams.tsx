import PaginationParams from "~/interfaces/queryParams/PaginationParams";

export default interface TransactionLoaderParams extends PaginationParams {
  name: string | null;
  is_personal_or_company: "personal" | "company" | "all";
  is_income_or_expense: "income" | "expense" | "all";
  date_after: string | null;
  date_before: string | null;
  amount_greater: number | null;
  amount_less: number | null;
  income: string | null;
  expense: string | null;
  company: string | null;
}
