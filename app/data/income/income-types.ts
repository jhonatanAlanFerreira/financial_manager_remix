import { Company, Income } from "@prisma/client";

export interface IncomeWithRelationsInterface extends Income {
  companies: Company[];
}

export const incomeIncludeOptions = ["companies"] as const;
export type IncomeIncludeOptions = (typeof incomeIncludeOptions)[number];
