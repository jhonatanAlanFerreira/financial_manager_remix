import { Prisma } from "@prisma/client";
import { requireUserSession } from "~/data/auth/auth.server";
import { prisma } from "~/data/database/database.server";
import { listTransactionResolverParams } from "~/data/graphql/schema/resolvers/transaction/list-transactions-resolver-interfaces";

export const listTransactions = async (
  parent: any,
  {
    is_income_or_expense,
    is_personal_or_company,
    name,
  }: listTransactionResolverParams,
  context: { request: Request }
) => {
  const user = await requireUserSession(context.request);

  const whereClause: Prisma.TransactionWhereInput = {
    user_id: user.id,
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
