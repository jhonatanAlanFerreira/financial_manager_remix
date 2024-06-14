import PaginationParams from "~/interfaces/queryParams/PaginationParams";

export default interface ExpenseLoaderParams extends PaginationParams {
  name: string | null;
  is_personal_expense: boolean;
  amount_greater: number | null;
  amount_less: number | null;
  company: string | null;
}
