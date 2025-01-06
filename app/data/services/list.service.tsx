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
  const whereClause: Record<string, any> = {};

  if (params) {
    if (params.name) {
      whereClause.name = { contains: params.name, mode: "insensitive" };
    }

    if (params.income) {
      whereClause.income_id = params.income;
    }

    if (params.account) {
      whereClause.account_id = params.account;
    }

    if (params.classification) {
      whereClause.transaction_classification = params.classification;
    }

    if (params.expense) {
      whereClause.expense_id = params.expense;
    }

    if (params.merchant) {
      whereClause.merchant_id = params.merchant;
    }

    if (params.company) {
      whereClause.company_id = params.company;
    }

    if (params.has_company) {
      whereClause.company_ids = { has: params.has_company };
    }

    if (params.has_classification) {
      whereClause.transaction_classification_ids = {
        has: params.has_classification,
      };
    }

    if (
      params.is_personal_or_company &&
      params.is_personal_or_company !== "all"
    ) {
      whereClause.is_personal =
        params.is_personal_or_company === "personal" ? true : false;
    }

    if (params.is_income_or_expense && params.is_income_or_expense !== "all") {
      whereClause.is_income =
        params.is_income_or_expense === "income" ? true : false;
    }

    if (params.amount_greater || params.amount_less) {
      whereClause.amount = {};
      if (params.amount_greater) {
        whereClause.amount.gte = params.amount_greater;
      }
      if (params.amount_less) {
        whereClause.amount.lte = params.amount_less;
      }
    }

    if (params.date_after || params.date_before) {
      whereClause.date = {};
      if (params.date_after) {
        whereClause.date.gte = params.date_after;
      }
      if (params.date_before) {
        whereClause.date.lte = params.date_before;
      }
    }
  }

  return whereClause;
}

function buildOrderByQuery(sortParams: {
  column: string | undefined;
  order: "asc" | "desc";
}) {
  const { column, order } = sortParams;

  if (!column) {
    return undefined;
  }

  if (column === "company") {
    return { company: { name: order } };
  }

  if (column === "expense") {
    return { expense: { name: order } };
  }

  if (column === "income") {
    return { income: { name: order } };
  }

  if (column === "merchant") {
    return { merchant: { name: order } };
  }

  if (column === "is_personal_or_company") {
    return { is_personal: order === "asc" ? "asc" : "desc" };
  }

  if (column === "is_income_or_expense") {
    return { is_income: order === "asc" ? "asc" : "desc" };
  }

  return { [column]: order };
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
