import { Prisma } from "@prisma/client";
import { requireUserSession } from "~/data/auth/auth.server";
import { prisma } from "~/data/database/database.server";
import { ListTransactionResolverParamsInterface } from "~/data/graphql/schema/resolvers/transaction/list-transactions-resolver-interfaces";

const buildTransactionWhereClause = (
  userId: string,
  parentFilter: Prisma.TransactionWhereInput = {},
  params: Partial<ListTransactionResolverParamsInterface> = {}
): Prisma.TransactionWhereInput => {
  return {
    user_id: userId,
    ...parentFilter,
    ...(params.name && {
      name: { contains: params.name, mode: "insensitive" },
    }),
    ...(params.is_personal_or_company &&
      params.is_personal_or_company !== "ALL" && {
        is_personal: params.is_personal_or_company === "PERSONAL_ONLY",
      }),
    ...(params.is_income_or_expense &&
      params.is_income_or_expense !== "ALL" && {
        is_income: params.is_income_or_expense === "INCOME_ONLY",
      }),
  };
};

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
  context: { request: Request }
) => {
  const user = await requireUserSession(context.request);
  const whereClause = buildTransactionWhereClause(
    user.id,
    { transaction_classification_ids: { has: parent.id } },
    params
  );

  return await prisma.transaction.findMany({ where: whereClause });
};
