export default interface TransactionCreateRequest {
  name: string;
  amount: number;
  company_id: string | null;
  expense_id: string | null;
  income_id: string | null;
  transaction_classification_id: string | null;
  user_id: string;
  transaction_date: string;
}
