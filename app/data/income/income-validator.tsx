import { User } from "@prisma/client";
import {
  IncomeCreateRequestInterface,
  IncomeUpdateRequestInterface,
} from "~/data/income/income-request-interfaces";
import { prisma } from "~/data/database/database.server";
import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";
import {
  validateCompanies,
  validateCompany,
  validateIdFormat,
  validateNumber,
  validatePaginationParams,
} from "~/data/services/validators";
import { IncomeLoaderParamsInterface } from "./income-query-params-interfaces";

export async function incomeCreateValidator(
  data: IncomeCreateRequestInterface,
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

  if (data.companies?.length && data.is_personal) {
    return {
      errorCode: 400,
      errors: {
        empty: "Personal income can not have companies",
      },
    };
  }

  const companyErrors = validateCompanies(data.companies, user);
  if (companyErrors) {
    return companyErrors;
  }

  const incomeExists = await prisma.income.findFirst({
    where: {
      name: data.name,
      user_id: user.id,
      is_personal: data.is_personal,
    },
  });

  if (incomeExists !== null) {
    return {
      errorCode: 400,
      errors: {
        name: "This income already exists",
      },
    };
  }

  return null;
}

export async function incomeDeleteValidator(
  user: User,
  incomeId: string
): Promise<ServerResponseErrorInterface | null> {
  if (!validateIdFormat(incomeId)) {
    return {
      errorCode: 400,
      errors: {
        balance: "Invalid income ID format",
      },
    };
  }

  const incomeExistis = await prisma.income.findFirst({
    where: {
      id: incomeId,
      user_id: user.id,
    },
  });

  if (!incomeExistis) {
    return {
      errorCode: 404,
      errors: {
        id: "Income not found",
      },
    };
  }

  return null;
}

export async function incomeUpdateValidator(
  data: IncomeUpdateRequestInterface,
  user: User,
  incomeId: string
): Promise<ServerResponseErrorInterface | null> {
  if (!data.name) {
    return {
      errorCode: 400,
      errors: {
        empty: "Name can not be empty",
      },
    };
  }

  if (!validateIdFormat(incomeId)) {
    return {
      errorCode: 400,
      errors: {
        balance: "Invalid income ID format",
      },
    };
  }

  if (data.companies?.length && data.is_personal) {
    return {
      errorCode: 400,
      errors: {
        empty: "Personal income can not have companies",
      },
    };
  }

  const income = await prisma.income.findFirst({
    where: {
      id: incomeId,
      user_id: user.id,
    },
  });

  if (!income) {
    return {
      errorCode: 404,
      errors: {
        id: "Income not found",
      },
    };
  }

  const companyErrors = validateCompanies(data.companies, user);
  if (companyErrors) {
    return companyErrors;
  }

  const incomeExists = await prisma.income.findFirst({
    where: {
      AND: [
        { id: { not: incomeId } },
        { name: data.name },
        { user_id: user.id },
        { is_personal: data.is_personal },
      ],
    },
  });

  if (incomeExists !== null) {
    return {
      errorCode: 400,
      errors: {
        name: "This income already exists",
      },
    };
  }

  return null;
}

export async function incomeListValidator(
  params: IncomeLoaderParamsInterface,
  user: User
): Promise<ServerResponseErrorInterface | null> {
  const paginationErrors = validatePaginationParams(params);
  if (paginationErrors) {
    return paginationErrors;
  }

  const companyErrors = await validateCompany(params.has_company, user);
  if (companyErrors) {
    return companyErrors;
  }

  if (!validateNumber(params.amount_greater)) {
    return {
      errorCode: 400,
      errors: {
        amount_greater: "Amount must be a valid number",
      },
    };
  }

  if (!validateNumber(params.amount_less)) {
    return {
      errorCode: 400,
      errors: {
        amount_less: "Amount must be a valid number",
      },
    };
  }

  return null;
}
