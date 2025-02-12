import { createTransactionLoaders } from "~/data/graphql/loaders/transaction-loaders";

export const createLoaders = (userId: string) => ({
  transaction: createTransactionLoaders(userId),
});
