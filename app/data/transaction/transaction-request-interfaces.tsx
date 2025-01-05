export interface TransactionCreateRequestInterface {
  name: string;
  amount: number;
  company: string | undefined;
  merchant: string | undefined;
  expense: string | undefined;
  income: string | undefined;
  account: string;
  classifications: string[];
  date: string;
  is_personal: boolean;
  is_income: boolean;
  description: string;
}

export interface TransactionUpdateRequestInterface
  extends TransactionCreateRequestInterface {}
