import { createTransactionLoaders } from "~/data/graphql/loaders/transaction-loaders";
import { LoadersInterface } from "~/data/graphql/loaders/loaders-interface";

export const createLoaders = (userId: string): LoadersInterface => ({
  transaction: createTransactionLoaders(userId),
});
