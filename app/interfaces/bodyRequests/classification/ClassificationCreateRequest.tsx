export default interface ClassificationCreateRequest {
  name: string;
  companies?: string[];
  is_personal_transaction_classification: boolean;
  is_income: boolean;
}
