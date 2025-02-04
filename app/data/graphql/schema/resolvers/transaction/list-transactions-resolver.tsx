import { Prisma } from "@prisma/client";
import { requireUserSession } from "~/data/auth/auth.server";
import { prisma } from "~/data/database/database.server";
import { ListTransactionResolverParamsInterface } from "~/data/graphql/schema/resolvers/transaction/list-transactions-resolver-interfaces";

export const listTransactions = async (
  parent: { id: string },
  {
    is_income_or_expense = "ALL",
    is_personal_or_company = "ALL",
    name,
  }: ListTransactionResolverParamsInterface,
  context: { request: Request }
) => {
  const user = await requireUserSession(context.request);

  const whereClause: Prisma.TransactionWhereInput = {
    user_id: user.id,
    ...(parent && { transaction_classification_ids: { has: parent.id } }),
    ...(name && { name: { contains: name, mode: "insensitive" } }),
    ...(is_personal_or_company !== "ALL" && {
      is_personal: is_personal_or_company === "PERSONAL_ONLY",
    }),
    ...(is_income_or_expense !== "ALL" && {
      is_income: is_income_or_expense === "INCOME_ONLY",
    }),
  };

  return await prisma.transaction.findMany({
    where: whereClause,
  });
};
