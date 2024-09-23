export default interface TransactionCreateRequest {
  name: string;
  amount: number;
  company: string | null;
  expense: string | null;
  income: string | null;
  account: string;
  classifications: string[];
  transaction_date: string;
  is_personal_transaction: boolean;
  is_income: boolean;
}
