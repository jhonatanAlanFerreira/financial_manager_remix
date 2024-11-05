import { Company, Prisma, User } from "@prisma/client";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import { CompanyLoaderParamsInterface } from "~/data/company/company-query-params-interfaces";
import { prisma } from "~/data/database/database.server";
import {
  CompanyCreateRequestInterface,
  CompanyUpdateRequestInterface,
} from "~/data/company/company-request-interfaces";
import {
  companyCreateValidator,
  companyDeleteValidator,
  companyUpdateValidator,
  listCompaniesValidator,
} from "~/data/company/company-validator";
import { paginate } from "~/data/services/list.service";
import { CompanyIncludeOptions } from "~/data/company/company-types";

export async function list(
  user: User,
  params: CompanyLoaderParamsInterface
): Promise<ServerResponseInterface<Company[]>> {
  const serverError = await listCompaniesValidator(params);

  if (serverError) {
    return {
      errors: serverError,
      message: "There are some invalid params",
    };
  }

  const { page, pageSize, extends: companyIncludes, ...restParams } = params;

  return paginate<
    Company,
    Prisma.CompanyFindManyArgs,
    Prisma.CompanyCountArgs,
    CompanyIncludeOptions,
    Prisma.CompanyWhereInput
  >(
    prisma.company.findMany,
    prisma.company.count,
    { page, pageSize },
    restParams,
    companyIncludes,
    { user_id: user.id }
  );
}

export async function create(
  data: CompanyCreateRequestInterface,
  user: User
): Promise<ServerResponseInterface<Company | any>> {
  const serverError = await companyCreateValidator(data, user);

  if (serverError) {
    return {
      errors: serverError,
      message: "There are some errors in your form",
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
): Promise<ServerResponseInterface<Company | any>> {
  //WIP
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
