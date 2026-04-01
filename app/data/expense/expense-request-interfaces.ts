export interface ExpenseCreateRequestInterface {
  name: string;
  amount: number;
  is_personal: boolean;
  companies?: string[];
}

export interface ExpenseUpdateRequestInterface
  extends ExpenseCreateRequestInterface {}
