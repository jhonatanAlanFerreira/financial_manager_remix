import { Prisma } from "@prisma/client";

export type IncomeWithCompanies = Prisma.IncomeGetPayload<{
  include: {
    companies: true;
  };
}>;
