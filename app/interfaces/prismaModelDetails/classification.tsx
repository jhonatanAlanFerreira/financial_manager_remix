import { Prisma } from "@prisma/client";

export type ClassificationWithCompany =
  Prisma.TransactionClassificationGetPayload<{
    include: {
      company: true;
    };
  }>;
