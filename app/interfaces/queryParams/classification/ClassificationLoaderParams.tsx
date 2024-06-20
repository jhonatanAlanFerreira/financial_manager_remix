import PaginationParams from "~/interfaces/queryParams/PaginationParams";

export default interface ClassificationLoaderParams extends PaginationParams {
  name: string | null;
  company: string | null;
  is_personal_transaction_classification: boolean;
  is_income: boolean;
}
