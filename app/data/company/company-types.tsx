import { Prisma } from "@prisma/client";

export type CompanyWithAccountsType = Prisma.CompanyGetPayload<{
  include: {
    accounts: true;
  };
}>;
