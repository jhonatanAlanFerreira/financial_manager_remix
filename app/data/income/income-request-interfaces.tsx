export interface IncomeCreateRequestInterface {
  name: string;
  companies: string[];
  amount: number;
  is_personal_income: boolean;
}

export interface IncomeUpdateRequestInterface extends IncomeCreateRequestInterface {}