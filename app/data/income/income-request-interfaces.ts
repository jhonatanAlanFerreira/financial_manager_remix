export interface IncomeCreateRequestInterface {
  name: string;
  companies?: string[];
  amount: number;
  is_personal: boolean;
}

export interface IncomeUpdateRequestInterface
  extends IncomeCreateRequestInterface {}
