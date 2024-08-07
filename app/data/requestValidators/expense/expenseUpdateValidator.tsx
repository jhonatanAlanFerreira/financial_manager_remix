import { User } from "@prisma/client";
import ValidatedData from "~/interfaces/ValidatedData";
import { prisma } from "~/data/database.server";
import ExpenseUpdateRequest from "~/interfaces/bodyRequests/expense/ExpenseUpdateRequest";

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

  const expenseExists = await prisma.expense.findFirst({
    where: {
      AND: [
        { id: { not: expenseId } },
        { name: data.name },
        { user_id: user.id },
        { is_personal_expense: data.is_personal_expense },
      ],
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
