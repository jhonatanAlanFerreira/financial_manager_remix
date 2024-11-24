import { Prisma } from "@prisma/client";

export const companyIncludeOptions = ["accounts"] as const;
export type CompanyIncludeOptions = (typeof companyIncludeOptions)[number];

export type CompanyWithAccountsType = Prisma.CompanyGetPayload<{
    include: {
      accounts: true;
    };
  }>;