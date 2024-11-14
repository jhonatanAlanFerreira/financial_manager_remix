import { User } from "@prisma/client";
import {
  IncomeCreateRequestInterface,
  IncomeUpdateRequestInterface,
} from "~/data/income/income-request-interfaces";
import { prisma } from "~/data/database/database.server";
import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";
import { validateCompanies } from "~/data/services/validators";

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
): Promise<any> {
  //WIP
  const incomeExistis = await prisma.income.findFirst({
    where: {
      id: incomeId,
      user_id: user.id,
    },
  });

  if (!incomeExistis) {
    return {
      isValid: false,
      errors: {
        id: "Income not found",
      },
    };
  }

  return {
    isValid: true,
  };
}

export async function incomeUpdateValidator(
  data: IncomeUpdateRequestInterface,
  user: User,
  incomeId: string
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

  const income = await prisma.income.findFirst({
    where: {
      id: incomeId,
      user_id: user.id,
    },
  });

  if (!income) {
    return {
      isValid: false,
      errors: {
        id: "Income not found",
      },
    };
  }

  if (data.companies?.length) {
    const companiesFromSameUser = await prisma.company.findMany({
      where: {
        id: {
          in: data.companies,
        },
        user_id: user.id,
      },
    });
    if (companiesFromSameUser.length != data.companies.length) {
      return {
        isValid: false,
        errors: {
          company_ids: "There are some invalid companies",
        },
      };
    }
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
      isValid: false,
      errors: {
        name: "This income already exists",
      },
    };
  }

  return {
    isValid: true,
  };
}
