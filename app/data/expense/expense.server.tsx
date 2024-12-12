import { Expense, Prisma, User } from "@prisma/client";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import {
  ExpenseCreateRequestInterface,
  ExpenseUpdateRequestInterface,
} from "~/data/expense/expense-request-interfaces";
import {
  expenseCreateValidator,
  expenseDeleteValidator,
  expenseListValidator,
  expenseUpdateValidator,
} from "~/data/expense/expense-validator";
import { ExpenseLoaderParamsInterface } from "~/data/expense/expense-query-params-interfaces";
import { prisma } from "~/data/database/database.server";
import { paginate } from "~/data/services/list.service";

export async function create(
  data: ExpenseCreateRequestInterface,
  user: User
): Promise<ServerResponseInterface> {
  const serverError = await expenseCreateValidator(data, user);

  if (serverError) {
    return {
      serverError,
      message: "There are some errors in your form",
    };
  }

  const expense = await prisma.expense.create({
    data: {
      name: data.name,
      amount: data.amount,
      is_personal: data.is_personal,
      user_id: user.id,
      company_ids: data.companies,
    },
  });

  return {
    data: expense,
    message: "Expense was created successfully",
  };
}

export async function list(
  user: User,
  params: ExpenseLoaderParamsInterface
): Promise<ServerResponseInterface<Expense[]>> {
  const serverError = await expenseListValidator(params, user);

  if (serverError) {
    return {
      serverError,
      message: "There are some invalid params",
    };
  }

  const { page, pageSize, extends: expenseIncludes, ...restParams } = params;

  return paginate<Expense, Prisma.ExpenseFindManyArgs, Prisma.ExpenseCountArgs>(
    prisma.expense.findMany,
    prisma.expense.count,
    { page, pageSize },
    restParams,
    { user_id: user.id },
    expenseIncludes
  );
}

export async function remove(
  expenseId: string,
  user: User
): Promise<ServerResponseInterface> {
  const serverError = await expenseDeleteValidator(user, expenseId);

  if (serverError) {
    return {
      serverError,
      message: "There are some invalid params",
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

export async function update(
  expenseId: string,
  user: User,
  data: ExpenseUpdateRequestInterface
): Promise<ServerResponseInterface> {
  const serverError = await expenseUpdateValidator(expenseId, user, data);

  if (serverError) {
    return {
      serverError,
      message: "There are some errors in your form",
    };
  }

  const res = await prisma.expense.update({
    data: {
      name: data.name,
      amount: data.amount,
      is_personal: data.is_personal,
      user_id: user.id,
      company_ids: data.companies,
    },
    where: {
      id: expenseId,
    },
  });

  return {
    data: res,
    message: "Expense was updated successfully",
  };
}
