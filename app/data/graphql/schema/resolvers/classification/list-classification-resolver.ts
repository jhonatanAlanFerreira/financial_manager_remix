import { Prisma } from "@prisma/client";
import { requireUserSession } from "~/data/auth/auth.server";
import { prisma } from "~/data/database/database.server";
import { ListClassificationResolverParamsInterface } from "~/data/graphql/schema/resolvers/classification/list-classification-resolver-interfaces";

export const listClassifications = async (
  parent: any,
  {
    is_income_or_expense = "ALL",
    is_personal_or_company = "ALL",
    name,
    company_id,
  }: ListClassificationResolverParamsInterface,
  context: { request: Request }
) => {
  const user = await requireUserSession(context.request);

  const whereClause: Prisma.TransactionClassificationWhereInput = {
    user_id: user.id,
    ...(name && { name: { contains: name, mode: "insensitive" } }),
    ...(is_personal_or_company !== "ALL" && {
      is_personal: is_personal_or_company === "PERSONAL_ONLY",
    }),
    ...(is_income_or_expense !== "ALL" && {
      is_income: is_income_or_expense === "INCOME_ONLY",
    }),
    ...(company_id && { company_ids: { has: company_id } }),
  };

  return await prisma.transactionClassification.findMany({
    where: whereClause,
  });
};
