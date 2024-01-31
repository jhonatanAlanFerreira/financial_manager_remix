export default interface ClassificationCreateRequest {
  name: string;
  company_id?: string | null;
  is_personal_transaction_classification: boolean;
}
