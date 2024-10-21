import { Company, Prisma, User } from "@prisma/client";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import { CompanyLoaderParamsInterface } from "~/data/company/company-query-params-interfaces";
import { CompanyWithAccountsType } from "~/data/company/company-types";
import { prisma } from "~/data/database/database.server";
import {
  CompanyCreateRequestInterface,
  CompanyUpdateRequestInterface,
} from "~/data/company/company-request-interfaces";
import {
  companyCreateValidator,
  companyDeleteValidator,
  companyUpdateValidator,
} from "~/data/company/company-validator";

type CompanyWhereInput = Prisma.CompanyWhereInput;

export async function list(
  user: User,
  params: CompanyLoaderParamsInterface
): Promise<ServerResponseInterface<Company[] | CompanyWithAccountsType[]>> {
  const take = params.pageSize != "all" ? params.pageSize : undefined;
  const skip =
    params.pageSize != "all" ? (params.page - 1) * params.pageSize : undefined;

  const whereClause: CompanyWhereInput = {
    user_id: user.id,
  };

  if (params.name) {
    whereClause.name = { contains: params.name, mode: "insensitive" };
  }

  const companies = await prisma.company.findMany({
    where: whereClause,
    skip,
    take,
    include: { accounts: params.with_accounts },
  });

  const totalData = await prisma.company.count({
    where: whereClause,
  });

  const totalPages =
    params.pageSize != "all" ? Math.ceil(totalData / params.pageSize) : 1;
  const pageSize = params.pageSize != "all" ? params.pageSize : totalData;

  return {
    data: companies,
    pageInfo: {
      currentPage: params.page,
      pageSize,
      totalData,
      totalPages,
    },
  };
}

export async function create(
  data: CompanyCreateRequestInterface,
  user: User
): Promise<ServerResponseInterface<Company | any>> { //WIP
  const dataIsValid = await companyCreateValidator(data, user);

  if (!dataIsValid.isValid) {
    return {
      //error: true, WIP
      message: "There are some errors in your form",
      data: dataIsValid,
    };
  }

  const company = await prisma.company.create({
    data: {
      name: data.name,
      user_id: user.id,
    },
  });

  return {
    data: company,
    message: "Company was created successfully",
  };
}

export async function update(
  data: CompanyUpdateRequestInterface,
  user: User,
  companyId: string
): Promise<ServerResponseInterface<Company | any>> { //WIP
  const dataIsValid = await companyUpdateValidator(data, user, companyId);

  if (!dataIsValid.isValid) {
    return {
       //error: true, WIP
      message: "There are some errors in your form",
      data: dataIsValid,
    };
  }

  const res = await prisma.company.update({
    data,
    where: {
      id: companyId,
    },
  });

  return {
    data: res,
    message: "Company was updated successfully",
  };
}

export async function remove(
  companyId: string,
  user: User
): Promise<ServerResponseInterface> {
  const dataIsValid = await companyDeleteValidator(user, companyId);

  if (!dataIsValid.isValid) {
    return {
       //error: true, WIP
      message: "Company not found",
      data: dataIsValid,
    };
  }

  await prisma.company.delete({
    where: {
      id: companyId,
    },
  });

  return {
    message: "Company removed successfully",
  };
}
