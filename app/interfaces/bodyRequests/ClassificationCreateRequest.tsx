export default interface ClassificationCreateRequest {
  name: string;
  company_ids?: string[];
  is_personal_transaction_classification: boolean;
  is_income: boolean;
}
