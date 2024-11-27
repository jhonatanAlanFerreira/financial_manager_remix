import { Company, TransactionClassification } from "@prisma/client";

export interface ClassificationWithRelationsInterface
  extends TransactionClassification {
  companies: Company[];
}

export const classificationIncludeOptions = [
  "transactions",
  "companies",
] as const;
export type ClassificationIncludeOptions =
  (typeof classificationIncludeOptions)[number];
