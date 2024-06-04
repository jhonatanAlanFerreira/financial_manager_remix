export default interface IncomeCreateRequest {
  name: string;
  companies: string[];
  amount: number;
  is_personal_income: boolean;
}
