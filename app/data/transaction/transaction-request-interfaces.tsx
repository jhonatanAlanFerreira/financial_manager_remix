export interface TransactionCreateRequestInterface {
  name: string;
  amount: number;
  company: string | undefined;
  expense: string | undefined;
  income: string | undefined;
  account: string;
  classifications: string[];
  transaction_date: string;
  is_personal: boolean;
  is_income: boolean;
}

export interface TransactionUpdateRequestInterface
  extends TransactionCreateRequestInterface {}
