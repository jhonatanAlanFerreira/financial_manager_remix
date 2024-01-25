export default interface ExpenseCreateRequest {
  name: string;
  amount: number;
  is_personal_expense: boolean;
  company_ids?: string[];
}
