export default interface IncomeCreateRequest {
  name: string;
  company_ids: string[];
  amount: number;
  is_personal_income: boolean;
}
