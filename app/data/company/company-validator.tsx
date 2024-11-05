import { User } from "@prisma/client";
import {
  CompanyCreateRequestInterface,
  CompanyUpdateRequestInterface,
} from "~/data/company/company-request-interfaces";
import { prisma } from "~/data/database/database.server";
import { CompanyLoaderParamsInterface } from "~/data/company/company-query-params-interfaces";
import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";
import { validatePaginationParams } from "~/data/services/validators";

export async function companyCreateValidator(
  data: CompanyCreateRequestInterface,
  user: User
): Promise<ServerResponseErrorInterface | null> {
  if (!data.name) {
    return {
      errorCode: 400,
      errors: {
        empty: "Name can not be empty",
      },
    };
  }

  const companyExists = await prisma.company.findFirst({
    where: {
      name: data.name,
      user_id: user.id,
    },
  });

  if (companyExists !== null) {
    return {
      errorCode: 400,
      errors: {
        name: "This company already exists",
      },
    };
  }

  return null;
}

export async function companyDeleteValidator(
  user: User,
  companyId: string
): Promise<any> {
  //WIP
  const companyExistis = await prisma.company.findFirst({
    where: {
      id: companyId,
      user_id: user.id,
    },
  });

  if (!companyExistis) {
    return {
      isValid: false,
      errors: {
        id: "Company not found",
      },
    };
  }

  return {
    isValid: true,
  };
}

export async function companyUpdateValidator(
  data: CompanyUpdateRequestInterface,
  user: User,
  companyId: string
): Promise<any> {
  //WIP
  if (!data.name) {
    return {
      isValid: false,
      errors: {
        empty: "Name can not be empty",
      },
    };
  }

  const company = await prisma.company.findFirst({
    where: {
      id: companyId,
      user_id: user.id,
    },
  });

  if (!company) {
    return {
      isValid: false,
      errors: {
        id: "Company not found",
      },
    };
  }

  const companyExists = await prisma.company.findFirst({
    where: {
      NOT: { id: companyId },
      name: data.name,
      user_id: user.id,
    },
  });

  if (companyExists !== null) {
    return {
      isValid: false,
      errors: {
        name: "This company already exists",
      },
    };
  }

  return {
    isValid: true,
  };
}

export async function listCompaniesValidator(
  params: CompanyLoaderParamsInterface
): Promise<ServerResponseErrorInterface | null> {
  const paginationErrors = validatePaginationParams(params);
  if (paginationErrors) {
    return paginationErrors;
  }

  return null;
}
