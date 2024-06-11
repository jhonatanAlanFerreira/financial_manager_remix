import { Prisma, Transaction, User } from "@prisma/client";
import ServerResponse from "~/interfaces/ServerResponse";
import { prisma } from "~/data/database.server";
import TransactionCreateRequest from "~/interfaces/bodyRequests/transaction/TransactionCreateRequest";
import TransactionCreateValidator from "~/data/requestValidators/transaction/transactionCreateValidator";
import transactionDeleteValidator from "~/data/requestValidators/transaction/transactionDeleteValidator";
import TransactionUpdateRequest from "~/interfaces/bodyRequests/transaction/TransactionUpdateRequest";
import transactionUpdateValidator from "~/data/requestValidators/transaction/transactionUpdateValidator";
import TransactionLoaderParams from "~/interfaces/queryParams/transaction/TransactionLoaderParams";

type TransactionWhereInput = Prisma.TransactionWhereInput;

export async function list(
  user: User,
  params: TransactionLoaderParams
): Promise<ServerResponse<Transaction[]>> {
  const skip = (params.page - 1) * params.pageSize;

  const whereClause: TransactionWhereInput = {
    user_id: user.id,
  };

  if (params.is_personal_transaction) {
    whereClause.is_personal_transaction = true;
  }

  if (params.is_income_transaction) {
    whereClause.is_income = true;
  }

  if (params.name) {
    whereClause.name = { contains: params.name };
  }

  if (params.date_after || params.date_before) {
    whereClause.transaction_date = {};
    if (params.date_after) {
      whereClause.transaction_date.gte = params.date_after;
    }
    if (params.date_before) {
      whereClause.transaction_date.lte = params.date_before;
    }
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

  if (params.income) {
    whereClause.income_id = params.income;
  }

  if (params.expense) {
    whereClause.expense_id = params.expense;
  }

  if (params.company) {
    whereClause.company_id = params.company;
  }

  const totalData = await prisma.transaction.count({
    where: whereClause,
  });

  const totalPages = Math.ceil(totalData / params.pageSize);

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    skip: skip,
    take: params.pageSize,
  });

  return {
    data: transactions,
    pageInfo: {
      currentPage: params.page,
      pageSize: params.pageSize,
      totalData,
      totalPages,
    },
  };
}

export async function create(
  data: TransactionCreateRequest,
  user: User
): Promise<ServerResponse> {
  const dataIsValid = await TransactionCreateValidator(data, user);

  if (!dataIsValid.isValid) {
    return {
      error: true,
      message: "There are some errors in your form",
      data: dataIsValid,
    };
  }

  const transaction = await prisma.transaction.create({
    data: {
      name: data.name,
      amount: data.amount,
      transaction_date: data.transaction_date,
      company_id: data.company,
      expense_id: data.expense,
      income_id: data.income,
      is_income: data.is_income,
      is_personal_transaction: data.is_personal_transaction,
      transaction_classification_ids: data.classifications,
      user_id: user.id,
    },
  });

  return {
    data: transaction,
    message: "Transaction was created successfully",
  };
}

export async function remove(
  transactionId: string,
  user: User
): Promise<ServerResponse> {
  const dataIsValid = await transactionDeleteValidator(user, transactionId);

  if (!dataIsValid.isValid) {
    return {
      error: true,
      message: "Transaction not found",
      data: dataIsValid,
    };
  }

  await prisma.transaction.delete({
    where: {
      id: transactionId,
    },
  });

  return {
    message: "Transaction removed successfully",
  };
}

export async function update(
  transactionId: string,
  user: User,
  data: TransactionUpdateRequest
): Promise<ServerResponse> {
  const dataIsValid = await transactionUpdateValidator(
    transactionId,
    user,
    data
  );

  if (!dataIsValid.isValid) {
    return {
      error: true,
      message: "There are some errors in your form",
      data: dataIsValid,
    };
  }

  const res = await prisma.transaction.update({
    data: {
      name: data.name,
      amount: data.amount,
      transaction_date: data.transaction_date,
      company_id: data.company,
      expense_id: data.expense,
      income_id: data.income,
      is_income: data.is_income,
      is_personal_transaction: data.is_personal_transaction,
      transaction_classification_ids: data.classifications,
    },
    where: {
      id: transactionId,
    },
  });

  return {
    data: res,
    message: "Transaction was updated successfully",
  };
}
