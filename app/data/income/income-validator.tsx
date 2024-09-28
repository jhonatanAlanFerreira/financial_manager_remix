import { User } from "@prisma/client";
import ValidatedData from "~/interfaces/ValidatedData";
import IncomeCreateRequest from "~/interfaces/bodyRequests/income/IncomeCreateRequest";
import IncomeUpdateRequest from "~/interfaces/bodyRequests/income/IncomeUpdateRequest";
import { prisma } from "../database/database.server";

export async function incomeCreateValidator(
  data: IncomeCreateRequest,
  user: User
): Promise<ValidatedData> {
  if (!data.name) {
    return {
      isValid: false,
      errors: {
        empty: "Name can not be empty",
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

  const incomeExists = await prisma.income.findUnique({
    where: {
      user_id_name_is_personal_income: {
        name: data.name,
        user_id: user.id,
        is_personal_income: data.is_personal_income,
      },
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

export async function incomeDeleteValidator(
  user: User,
  incomeId: string
): Promise<ValidatedData> {
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
  data: IncomeUpdateRequest,
  user: User,
  incomeId: string
): Promise<ValidatedData> {
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
        { is_personal_income: data.is_personal_income },
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