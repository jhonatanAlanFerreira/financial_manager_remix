import { Account, Company } from "@prisma/client";

export const companyIncludeOptions = ["accounts"] as const;
export type CompanyIncludeOptions = (typeof companyIncludeOptions)[number];

export interface CompanyWithRelationsInterface extends Company {
  accounts: Account[];
}
