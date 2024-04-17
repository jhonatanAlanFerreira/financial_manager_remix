import { User } from "@prisma/client";
import ValidatedData from "~/interfaces/ValidatedData";
import IncomeUpdateRequest from "~/interfaces/bodyRequests/IncomeUpdateRequest";
import { prisma } from "~/data/database.server";

export default async function incomeUpdateValidator(
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

  if (data.company_ids?.length) {
    const companiesFromSameUser = await prisma.company.findMany({
      where: {
        id: {
          in: data.company_ids,
        },
        user_id: user.id,
      },
    });
    if (companiesFromSameUser.length != data.company_ids.length) {
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
        { is_personal_income: data.is_personal_income }
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
