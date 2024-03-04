export default interface TransactionCreateRequest {
  name: string;
  amount: number;
  company_id: string | null;
  expense_id: string | null;
  income_id: string | null;
  transaction_classification_ids: string[];
  user_id: string;
  transaction_date: string;
  is_personal_transaction: boolean;
  is_income: boolean;
}
