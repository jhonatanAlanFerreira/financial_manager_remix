import { requireUserSession } from "~/data/auth/auth.server";
import { prisma } from "~/data/database/database.server";
import { createLoaders } from "~/data/graphql/loaders";
import { LoadersInterface } from "~/data/graphql/loaders/loaders-interface";
import { buildTransactionWhereClause } from "~/data/graphql/query-builders/transactions-query-builders";
import { ListTransactionResolverParamsInterface } from "~/data/graphql/schema/resolvers/transaction/list-transactions-resolver-interfaces";

export const listTransactions = async (
  parent: any,
  params: ListTransactionResolverParamsInterface,
  context: { request: Request }
) => {
  const user = await requireUserSession(context.request);
  const whereClause = buildTransactionWhereClause(user.id, {}, params);

  return await prisma.transaction.findMany({ where: whereClause });
};

export const listTransactionsByClassification = async (
  parent: { id: string },
  params: ListTransactionResolverParamsInterface,
  context: { request: Request; loaders: LoadersInterface }
) => {
  return context.loaders.transaction.listTransactionsByClassificationsLoader.load(
    {
      classificationId: parent.id,
      filters: params,
    }
  );
};
