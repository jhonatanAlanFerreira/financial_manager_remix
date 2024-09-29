import { Prisma } from "@prisma/client";

export type ClassificationWithCompanyType =
  Prisma.TransactionClassificationGetPayload<{
    include: {
      companies: true;
    };
  }>;
