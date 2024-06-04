import { User } from "@prisma/client";
import ValidatedData from "~/interfaces/ValidatedData";
import { prisma } from "~/data/database.server";

export default async function expenseDeleteValidator(
  user: User,
  expenseId: string
): Promise<ValidatedData> {
  const expenseExistis = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      user_id: user.id,
    },
  });

  if (!expenseExistis) {
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
