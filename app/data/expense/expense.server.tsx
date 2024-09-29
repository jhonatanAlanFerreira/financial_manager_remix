import ServerResponse from "~/interfaces/ServerResponse";
import { Expense, Prisma, User } from "@prisma/client";
import { expenseCreateValidator, expenseDeleteValidator, expenseUpdateValidator } from "./expense-validator";
import { prisma } from "../database/database.server";
import { ExpenseCreateRequestInterface, ExpenseUpdateRequestInterface } from "./expense-request-interfaces";
import { ExpenseWithCompaniesType } from "./expense-types";
import ExpenseLoaderParamsInterface from "./expense-query-params-interfaces";

type ExpenseWhereInput = Prisma.ExpenseWhereInput;

export async function create(
  data: ExpenseCreateRequestInterface,
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
): Promise<ServerResponse<Expense[] | ExpenseWithCompaniesType[]>> {
  const take = params.pageSize != "all" ? params.pageSize : undefined;
  const skip =
    params.pageSize != "all" ? (params.page - 1) * params.pageSize : undefined;

  const whereClause: ExpenseWhereInput = {
    user_id: user.id,
  };

  whereClause.is_personal_expense =
    params.is_personal_or_company !== "all"
      ? params.is_personal_or_company === "personal"
      : undefined;

  if (params.name) {
    whereClause.name = { contains: params.name, mode: "insensitive" };
  }

  if (params.amount_greater || params.amount_less) {
    whereClause.amount = {};
    if (params.amount_greater) {
      whereClause.amount.gte = params.amount_greater;
    }
    if (params.amount_less) {
      whereClause.amount.lte = params.amount_less;
    }
  }

  if (params.company) {
    whereClause.company_ids = {
      has: params.company,
    };
  }

  const expenses = await prisma.expense.findMany({
    where: whereClause,
    skip,
    take,
  });

  const totalData = await prisma.expense.count({
    where: whereClause,
  });

  const totalPages =
    params.pageSize != "all" ? Math.ceil(totalData / params.pageSize) : 1;
  const pageSize = params.pageSize != "all" ? params.pageSize : totalData;

  return {
    data: expenses,
    pageInfo: {
      currentPage: params.page,
      pageSize,
      totalData,
      totalPages,
    },
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

export async function update(
  expenseId: string,
  user: User,
  data: ExpenseUpdateRequestInterface
): Promise<ServerResponse> {
  const dataIsValid = await expenseUpdateValidator(expenseId, user, data);

  if (!dataIsValid.isValid) {
    return {
      error: true,
      message: "There are some errors in your form",
      data: dataIsValid,
    };
  }

  const res = await prisma.expense.update({
    data: {
      name: data.name,
      amount: data.amount,
      is_personal_expense: data.is_personal_expense,
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
