import { User } from "@prisma/client";
import ValidatedData from "~/interfaces/ValidatedData";
import IncomeCreateRequest from "~/interfaces/bodyRequests/IncomeCreateRequest";
import { prisma } from "~/data/database.server";

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
