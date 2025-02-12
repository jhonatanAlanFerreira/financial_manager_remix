import DataLoader from "dataloader";
import { ListTransactionResolverParamsInterface } from "~/data/graphql/schema/resolvers/transaction/list-transactions-resolver-interfaces";
import { buildTransactionWhereClause } from "~/data/graphql/query-builders/transactions-query-builders";
import { prisma } from "~/data/database/database.server";
import { Transaction } from "@prisma/client";

const listTransactionsByClassificationsLoader = (userId: string) => {
  return new DataLoader(
    async (
      keys: readonly {
        classificationId: string;
        filters: Partial<ListTransactionResolverParamsInterface>;
      }[]
    ) => {
      const classificationIds = keys.map((k) => k.classificationId);
      const filters = keys[0].filters;

      const whereClause = buildTransactionWhereClause(
        userId,
        {
          transaction_classification_ids: { hasSome: classificationIds },
        },
        filters
      );

      const transactions = await prisma.transaction.findMany({
        where: whereClause,
      });

      const transactionMap: Record<string, Transaction[]> = {};
      classificationIds.forEach((id) => (transactionMap[id] = []));

      transactions.forEach((tx) => {
        tx.transaction_classification_ids.forEach((cid) => {
          if (transactionMap[cid]) {
            transactionMap[cid].push(tx);
          }
        });
      });

      return classificationIds.map((id) => transactionMap[id]);
    }
  );
};

export const createTransactionLoaders = (userId: string) => ({
  listTransactionsByClassificationsLoader:
    listTransactionsByClassificationsLoader(userId),
});
