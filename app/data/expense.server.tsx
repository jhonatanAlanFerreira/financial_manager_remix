import ServerResponse from "~/interfaces/ServerResponse";
import ExpenseCreateRequest from "~/interfaces/bodyRequests/expense/ExpenseCreateRequest";
import { expenseCreateValidator } from "~/data/requestValidators/expense/expenseCreateValidator";
import { prisma } from "~/data/database.server";
import { Expense, Prisma, User } from "@prisma/client";
import { ExpenseWithCompanies } from "~/interfaces/prismaModelDetails/expense";
import expenseDeleteValidator from "~/data/requestValidators/expense/expenseDeleteValidator";
import ExpenseUpdateRequest from "~/interfaces/bodyRequests/expense/ExpenseUpdateRequest";
import { expenseUpdateValidator } from "~/data/requestValidators/expense/expenseUpdateValidator";
import ExpenseLoaderParams from "~/interfaces/queryParams/expense/ExpenseLoaderParams";

type ExpenseWhereInput = Prisma.ExpenseWhereInput;

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
  params: ExpenseLoaderParams
): Promise<ServerResponse<Expense[] | ExpenseWithCompanies[]>> {
  const skip = (params.page - 1) * params.pageSize;

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
    skip: skip,
    take: params.pageSize,
  });

  const totalData = await prisma.expense.count({
    where: whereClause,
  });

  const totalPages = Math.ceil(totalData / params.pageSize);

  return {
    data: expenses,
    pageInfo: {
      currentPage: params.page,
      pageSize: params.pageSize,
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
  data: ExpenseUpdateRequest
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
