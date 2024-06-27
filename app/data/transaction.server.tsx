import { Prisma, Transaction, User } from "@prisma/client";
import ServerResponse from "~/interfaces/ServerResponse";
import { prisma } from "~/data/database.server";
import TransactionCreateRequest from "~/interfaces/bodyRequests/transaction/TransactionCreateRequest";
import TransactionCreateValidator from "~/data/requestValidators/transaction/transactionCreateValidator";
import transactionDeleteValidator from "~/data/requestValidators/transaction/transactionDeleteValidator";
import TransactionUpdateRequest from "~/interfaces/bodyRequests/transaction/TransactionUpdateRequest";
import transactionUpdateValidator from "~/data/requestValidators/transaction/transactionUpdateValidator";
import TransactionLoaderParams from "~/interfaces/queryParams/transaction/TransactionLoaderParams";
import TransactionsWithTotals from "~/interfaces/pageComponents/transactions/TransactionsWithTotals";

type TransactionWhereInput = Prisma.TransactionWhereInput;

export async function list(
  user: User,
  params: TransactionLoaderParams
): Promise<ServerResponse<TransactionsWithTotals>> {
  const skip = (params.page - 1) * params.pageSize;

  const whereClause: TransactionWhereInput = {
    user_id: user.id,
    is_personal_transaction: params.is_personal_transaction || undefined,
    is_income:
      params.is_income_or_expense !== "all"
        ? params.is_income_or_expense === "income"
        : undefined,
    name: params.name ? { contains: params.name } : undefined,
    transaction_date: {
      gte: params.date_after || undefined,
      lte: params.date_before || undefined,
    },
    amount: {
      gte: params.amount_greater || undefined,
      lte: params.amount_less || undefined,
    },
    income_id: params.income || undefined,
    expense_id: params.expense || undefined,
    company_id: params.company || undefined,
  };

  const [totalData, totalExpense, totalIncome] = await prisma.$transaction([
    prisma.transaction.count({ where: whereClause }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { ...whereClause, is_income: false },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { ...whereClause, is_income: true },
    }),
  ]);

  const totalPages = Math.ceil(totalData / params.pageSize);

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    skip,
    take: params.pageSize,
  });

  const totalExpenseValue = totalExpense._sum.amount || 0;
  const totalIncomeValue = totalIncome._sum.amount || 0;

  const finalExpenseValue =
    params.is_income_or_expense === "income" ? 0 : totalExpenseValue;
  const finalIncomeValue =
    params.is_income_or_expense === "expense" ? 0 : totalIncomeValue;

  return {
    data: {
      transactions,
      totalExpenseValue: finalExpenseValue,
      totalIncomeValue: finalIncomeValue,
    },
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
