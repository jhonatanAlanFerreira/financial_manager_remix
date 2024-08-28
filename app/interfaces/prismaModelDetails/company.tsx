import { Prisma } from "@prisma/client";

export type CompanyWithAccounts = Prisma.CompanyGetPayload<{
  include: {
    accounts: true;
  };
}>;
