import { WhereParamsInterface } from "~/shared/where-params-interface";
import {
  AdditionalArgs,
  CountArgs,
  FindManyArgs,
  Models,
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

    if (params.company_id) {
      whereClause.company_id = params.company_id;
    }

    if (
      params.is_personal_or_company &&
      params.is_personal_or_company !== "all"
    ) {
      whereClause.is_personal =
        params.is_personal_or_company === "personal" ? true : false;
    }
  }

  return whereClause;
}

export async function paginate<
  Model extends Models,
  FindManyArg extends FindManyArgs,
  CountArg extends CountArgs,
  IncludeOption extends string
>(
  findManyQuery: (findManyArg: FindManyArg) => Promise<Model[]>,
  countQuery: (countArg: CountArg) => Promise<number>,
  paginationParams: PaginationParamsInterface = { page: 1, pageSize: "all" },
  whereParams?: WhereParamsInterface,
  includes?: IncludeOption[]
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

  const includeQuery = includes?.reduce(
    (acc, include) => ({ ...acc, [include]: true }),
    {} as Record<string, boolean>
  );

  const finalQuery = {
    where: whereClause,
    skip,
    take,
    include: includeQuery,
  } as FindManyArg;

  const data = await findManyQuery(finalQuery);
  const totalData = await countQuery({
    where: whereClause,
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
