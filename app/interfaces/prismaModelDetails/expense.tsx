import { Prisma } from "@prisma/client";

export type ExpenseWithCompanies = Prisma.ExpenseGetPayload<{
  include: {
    companies: true;
  };
}>;
