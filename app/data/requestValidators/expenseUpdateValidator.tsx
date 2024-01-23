import { User } from "@prisma/client";
import ValidatedData from "~/interfaces/ValidatedData";
import ExpenseUpdateRequest from "~/interfaces/bodyRequests/ExpenseUpdateRequest";
import { prisma } from "~/data/database.server";

export async function expenseUpdateValidator(
  expenseId: string,
  user: User,
  data: ExpenseUpdateRequest
): Promise<ValidatedData> {
  if (!data.name) {
    return {
      isValid: false,
      errors: {
        empty: "Name can not be empty",
      },
    };
  }

  const expense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      user_id: user.id,
    },
  });

  if (!expense) {
    return {
      isValid: false,
      errors: {
        id: "Expense not found",
      },
    };
  }

  return {
    isValid: true,
  };
}
