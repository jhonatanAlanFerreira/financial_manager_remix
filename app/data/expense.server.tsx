import ServerResponse from "~/interfaces/ServerResponse";
import ExpenseCreateRequest from "~/interfaces/bodyRequests/ExpenseCreateRequest";
import { expenseCreateValidator } from "./requestValidators/expenseCreateValidator";
import { prisma } from "~/data/database.server";
import { Expense, User } from "@prisma/client";
import { ExpenseWithCompanies } from "~/interfaces/prismaModelDetails/expense";
import expenseDeleteValidator from "./requestValidators/expenseDeleteValidator";

export async function create(
  data: ExpenseCreateRequest,
  user: User
): Promise<ServerResponse> {
  const dataIsValid = await expenseCreateValidator(data, user);

  if (!dataIsValid.isValid) {
    return {
      error: true,
      message: "There are some errors in your form",
      data: dataIsValid,
    };
  }

  const expense = await prisma.expense.create({
    data: {
      name: data.name,
      amount: data.amount,
      is_personal_expense: data.is_personal_expense,
      user_id: user.id,
    },
  });

  return {
    data: expense,
    message: "Expense was created successfully",
  };
}

export async function list(
  user: User,
  includeCompanies: boolean
): Promise<ServerResponse<Expense[] | ExpenseWithCompanies[]>> {
  const expenses = await prisma.expense.findMany({
    where: {
      user_id: user.id,
    },
    include: includeCompanies ? { companies: true } : undefined,
  });

  return {
    data: expenses,
  };
}

export async function remove(
  expenseId: string,
  user: User
): Promise<ServerResponse> {
  const dataIsValid = await expenseDeleteValidator(user, expenseId);

  if (!dataIsValid.isValid) {
    return {
      error: true,
      message: "Expense not found",
      data: dataIsValid,
    };
  }

  await prisma.expense.delete({
    where: {
      id: expenseId,
    },
  });

  return {
    message: "Expense removed successfully",
  };
}
