import ValidatedData from "~/interfaces/ValidatedData";
import ExpenseCreateRequest from "~/interfaces/bodyRequests/ExpenseCreateRequest";
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
      user_id_name: {
        name: data.name,
        user_id: user.id,
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

  return {
    isValid: true,
  };
}
