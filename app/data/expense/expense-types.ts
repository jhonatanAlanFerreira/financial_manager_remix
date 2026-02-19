import { Company, Expense } from "@prisma/client";

export interface ExpenseWithRelationsInterface extends Expense {
  companies: Company[];
}

export const expenseIncludeOptions = ["companies"] as const;
export type ExpenseIncludeOptions = (typeof expenseIncludeOptions)[number];
