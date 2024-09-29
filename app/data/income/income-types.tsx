import { Prisma } from "@prisma/client";

export type IncomeWithCompaniesType = Prisma.IncomeGetPayload<{
  include: {
    companies: true;
  };
}>;
