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
      name: data.name,
      user_id: user.id,
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

  return {
    isValid: true,
  };
}
