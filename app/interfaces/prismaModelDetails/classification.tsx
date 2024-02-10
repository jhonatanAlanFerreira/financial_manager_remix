import { Prisma } from "@prisma/client";

export type ClassificationWithCompany =
  Prisma.TransactionClassificationGetPayload<{
    include: {
      companies: true;
    };
  }>;
