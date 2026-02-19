export interface TransactionCreateRequestInterface {
  name: string;
  amount: number;
  company: string | undefined | null;
  merchant: string | undefined | null;
  expense: string | undefined | null;
  income: string | undefined | null;
  account: string;
  classifications: string[];
  date: string;
  is_personal: boolean;
  is_income: boolean;
  description: string;
}

export interface TransactionUpdateRequestInterface
  extends TransactionCreateRequestInterface {}
