import { WhereParamsInterface } from "~/shared/where-params-interface";
import {
  CountArgs,
  FindManyArgs,
  Models,
  WhereInputs,
} from "~/data/services/list-service-interfaces";
import { PaginationParamsInterface } from "~/shared/pagination-params-interface";

export function buildWhereClause(
  params?: Partial<WhereParamsInterface>
): Record<string, any> {
  if (!params) return {};

  const {
    name,
    income,
    account,
    classification,
    expense,
    merchant,
    company,
    has_company,
    has_classification,
    is_personal_or_company,
    is_income_or_expense,
    amount_greater,
    amount_less,
    date_after,
    date_before,
  } = params;

  const whereClause: Record<string, any> = {
    ...(name && { name: { contains: name, mode: "insensitive" } }),
    ...(income && { income_id: income }),
    ...(account && { account_id: account }),
    ...(classification && { transaction_classification: classification }),
    ...(expense && { expense_id: expense }),
    ...(merchant && { merchant_id: merchant }),
    ...(company && { company_id: company }),
    ...(has_company && { company_ids: { has: has_company } }),
    ...(has_classification && {
      transaction_classification_ids: { has: has_classification },
    }),
    ...(is_personal_or_company &&
      is_personal_or_company !== "all" && {
        is_personal: is_personal_or_company === "personal",
      }),
    ...(is_income_or_expense &&
      is_income_or_expense !== "all" && {
        is_income: is_income_or_expense === "income",
      }),
  };

  if (amount_greater || amount_less) {
    whereClause.amount = {
      ...(amount_greater && { gte: amount_greater }),
      ...(amount_less && { lte: amount_less }),
    };
  }

  if (date_after || date_before) {
    whereClause.date = {
      ...(date_after && { gte: date_after }),
      ...(date_before && { lte: date_before }),
    };
  }

  return whereClause;
}

function buildOrderByQuery(sortParams: {
  column: string | undefined;
  order: "asc" | "desc";
}) {
  const { column, order } = sortParams;

  if (!column) {
    return [{ id: order }];
  }

  const orderBy: Record<string, any>[] = [{ id: order }];

  switch (column) {
    case "company":
      orderBy.unshift({ company: { name: order } });
      break;
    case "expense":
      orderBy.unshift({ expense: { name: order } });
      break;
    case "income":
      orderBy.unshift({ income: { name: order } });
      break;
    case "merchant":
      orderBy.unshift({ merchant: { name: order } });
      break;
    case "is_personal_or_company":
      orderBy.unshift({ is_personal: order });
      break;
    case "is_income_or_expense":
      orderBy.unshift({ is_income: order });
      break;
    default:
      orderBy.unshift({ [column]: order });
      break;
  }

  return orderBy;
}

export async function paginate<
  Model extends Models,
  FindManyArg extends FindManyArgs,
  CountArg extends CountArgs,
  IncludeOption extends string = string,
  WhereType extends WhereInputs = {}
>(
  findManyQuery: (findManyArg: FindManyArg) => Promise<Model[]>,
  countQuery: (countArg: CountArg) => Promise<number>,
  paginationParams: PaginationParamsInterface = { page: 1, pageSize: "all" },
  whereParams?: WhereParamsInterface,
  additionalWhere?: WhereType,
  includes?: IncludeOption[],
  sortParams?: { column: string | undefined; order: "asc" | "desc" }
): Promise<{
  data: Model[];
  pageInfo: {
    currentPage: number;
    pageSize: number;
    totalData: number;
    totalPages: number;
  };
}> {
  const take =
    paginationParams.pageSize !== "all" ? paginationParams.pageSize : undefined;
  const skip =
    paginationParams.pageSize !== "all"
      ? (paginationParams.page - 1) * paginationParams.pageSize
      : undefined;

  const whereClause = buildWhereClause(whereParams);

  const finalWhereClause = { ...whereClause, ...additionalWhere };

  const includeQuery = includes?.reduce(
    (acc, include) => ({ ...acc, [include]: true }),
    {} as Record<string, boolean>
  );

  const orderByQuery = sortParams ? buildOrderByQuery(sortParams) : undefined;

  const finalQuery = {
    where: finalWhereClause,
    skip,
    take,
    include: includeQuery,
    orderBy: orderByQuery,
  } as FindManyArg;

  const data = await findManyQuery(finalQuery);
  const totalData = await countQuery({
    where: finalWhereClause,
  } as CountArg);

  const totalPages =
    paginationParams.pageSize !== "all"
      ? Math.ceil(totalData / paginationParams.pageSize)
      : 1;
  const pageSize =
    paginationParams.pageSize !== "all" ? paginationParams.pageSize : totalData;

  return {
    data,
    pageInfo: {
      currentPage: paginationParams.page,
      pageSize,
      totalData,
      totalPages,
    },
  };
}
