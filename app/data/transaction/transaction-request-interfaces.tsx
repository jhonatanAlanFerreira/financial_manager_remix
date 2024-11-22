export interface TransactionCreateRequestInterface {
  name: string;
  amount: number;
  company: string | null;
  expense: string | null;
  income: string | null;
  account: string;
  classifications: string[];
  transaction_date: string;
  is_personal: boolean;
  is_income: boolean;
}

export interface TransactionUpdateRequestInterface
  extends TransactionCreateRequestInterface {}
