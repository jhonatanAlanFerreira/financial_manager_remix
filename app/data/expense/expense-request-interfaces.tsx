export interface ExpenseCreateRequestInterface {
  name: string;
  amount: number;
  is_personal_expense: boolean;
  companies?: string[];
}

export interface ExpenseUpdateRequestInterface extends ExpenseCreateRequestInterface {}
