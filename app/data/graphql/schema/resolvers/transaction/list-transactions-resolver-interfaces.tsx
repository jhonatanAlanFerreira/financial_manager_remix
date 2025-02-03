export interface listTransactionResolverParams {
  name: string;
  is_personal_or_company: "PERSONAL_ONLY" | "COMPANY_ONLY" | "ALL";
  is_income_or_expense: "EXPENSE_ONLY" | "INCOME_ONLY" | "ALL";
}
