import PaginationParamsInterface from "~/shared/pagination-params-interface";

export default interface TransactionLoaderParamsInterface extends PaginationParamsInterface {
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
