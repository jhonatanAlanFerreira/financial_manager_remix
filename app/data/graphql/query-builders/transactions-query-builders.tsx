import { Prisma } from "@prisma/client";
import { ListTransactionResolverParamsInterface } from "~/data/graphql/schema/resolvers/transaction/list-transactions-resolver-interfaces";

export const buildTransactionWhereClause = (
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
