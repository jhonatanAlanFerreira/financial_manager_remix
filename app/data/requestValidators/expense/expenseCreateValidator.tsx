import ValidatedData from "~/interfaces/ValidatedData";
import ExpenseCreateRequest from "~/interfaces/bodyRequests/expense/ExpenseCreateRequest";
import { prisma } from "~/data/database.server";
import { User } from "@prisma/client";

export async function expenseCreateValidator(
  data: ExpenseCreateRequest,
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

  const expenseExists = await prisma.expense.findUnique({
    where: {
      user_id_name_is_personal_expense: {
        name: data.name,
        user_id: user.id,
        is_personal_expense: data.is_personal_expense,
      },
    },
  });

  if (expenseExists !== null) {
    return {
      isValid: false,
      errors: {
        name: "This expense already exists",
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

  return {
    isValid: true,
  };
}
