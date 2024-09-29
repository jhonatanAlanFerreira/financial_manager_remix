import { Prisma } from "@prisma/client";

export type ExpenseWithCompaniesType = Prisma.ExpenseGetPayload<{
  include: {
    companies: true;
  };
}>;
