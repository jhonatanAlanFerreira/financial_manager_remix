import PaginationParams from "~/interfaces/queryParams/PaginationParams";

export default interface TransactionLoaderParams extends PaginationParams {
  name: string | null;
  is_personal_transaction: boolean;
  is_income_transaction: boolean;
  date_after: string | null;
  date_before: string | null;
  amount_greater: number | null;
  amount_less: number | null;
  income: string | null;
  expense: string | null;
}
