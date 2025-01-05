import { Prisma, Transaction, User } from "@prisma/client";
import { prisma } from "~/data/database/database.server";
import { TransactionLoaderParamsInterface } from "~/data/transaction/transaction-query-params-interfaces";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import {
  TransactionCreateRequestInterface,
  TransactionUpdateRequestInterface,
} from "~/data/transaction/transaction-request-interfaces";
import {
  transactionCreateValidator,
  transactionDeleteValidator,
  transactionListValidator,
  transactionUpdateValidator,
} from "~/data/transaction/transaction-validator";
import { paginate } from "~/data/services/list.service";
import {
  TransactionsWithTotalsInterface,
  TransactionWithRelationsInterface,
} from "./transaction-types";
import { buildWhereClause } from "~/data/services/list.service";

export async function list(
  user: User,
  params: TransactionLoaderParamsInterface
): Promise<ServerResponseInterface<TransactionsWithTotalsInterface>> {
  const serverError = await transactionListValidator(params, user);

  if (serverError) {
    return {
      serverError,
      message: "There are some invalid params",
    };
  }

  const {
    page,
    pageSize,
    extends: transactionIncludes,
    ...restParams
  } = params;

  const transactions = await paginate<
    Transaction,
    Prisma.TransactionFindManyArgs,
    Prisma.TransactionCountArgs
  >(
    prisma.transaction.findMany,
    prisma.transaction.count,
    { page, pageSize },
    restParams,
    { user_id: user.id },
    transactionIncludes
  );

  const totals = await calculateTotals(user, params);

  return {
    ...transactions,
    data: {
      transactions: transactions.data as TransactionWithRelationsInterface[],
      totalExpenseValue: totals.totalExpenseValue,
      totalIncomeValue: totals.totalIncomeValue,
    },
  };
}

export async function create(
  data: TransactionCreateRequestInterface,
  user: User
): Promise<ServerResponseInterface<Transaction>> {
  const serverError = await transactionCreateValidator(data, user);

  if (serverError) {
    return {
      serverError,
      message: "There are some errors in your form",
    };
  }

  const account = await prisma.account.findUnique({
    where: { id: data.account },
  });

  let newBalance = account?.balance || 0;
  if (data.is_income) {
    newBalance += data.amount;
  } else {
    newBalance -= data.amount;
  }

  const transaction = await prisma.transaction.create({
    data: {
      name: data.name,
      amount: data.amount,
      date: data.date,
      company_id: data.company,
      account_id: data.account,
      expense_id: data.expense,
      income_id: data.income,
      merchant_id: data.merchant,
      is_income: data.is_income,
      is_personal: data.is_personal,
      transaction_classification_ids: data.classifications,
      user_id: user.id,
      description: data.description,
    },
  });

  await prisma.account.update({
    where: { id: data.account },
    data: { balance: +newBalance.toFixed(2) },
  });

  return {
    data: transaction,
    message: "Transaction was created successfully and balance adjusted",
  };
}

export async function remove(
  transactionId: string,
  user: User
): Promise<ServerResponseInterface> {
  const serverError = await transactionDeleteValidator(user, transactionId);

  if (serverError) {
    return {
      serverError,
      message: "There are some invalid params",
    };
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  const amount = transaction ? +transaction.amount.toFixed(2) : 0;

  await prisma.account.update({
    where: { id: transaction?.account_id },
    data: {
      balance: {
        increment: transaction?.is_income ? -amount : amount,
      },
    },
  });

  await prisma.transaction.delete({
    where: {
      id: transactionId,
    },
  });

  return {
    message: "Transaction removed successfully and balance adjusted",
  };
}

export async function update(
  transactionId: string,
  user: User,
  data: TransactionUpdateRequestInterface
): Promise<ServerResponseInterface> {
  const serverError = await transactionUpdateValidator(
    transactionId,
    user,
    data
  );

  if (serverError) {
    return {
      serverError,
      message: "There are some errors in your form",
    };
  }

  const existingTransaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  const adjustmentAmount = data.amount - (existingTransaction?.amount || 0);
  const adjustment = existingTransaction?.is_income
    ? adjustmentAmount
    : -adjustmentAmount;

  await prisma.account.update({
    where: { id: existingTransaction?.account_id },
    data: {
      balance: {
        increment: +adjustment.toFixed(2),
      },
    },
  });

  const updatedTransaction = await prisma.transaction.update({
    data: {
      name: data.name,
      amount: data.amount,
      date: data.date,
      company_id: data.company,
      expense_id: data.expense,
      income_id: data.income,
      merchant_id: data.merchant,
      is_income: data.is_income,
      is_personal: data.is_personal,
      transaction_classification_ids: data.classifications,
      description: data.description,
    },
    where: { id: transactionId },
  });

  return {
    data: updatedTransaction,
    message: "Transaction was updated successfully and balance adjusted",
  };
}

async function calculateTotals(
  user: User,
  filters: TransactionLoaderParamsInterface
): Promise<{ totalExpenseValue: number; totalIncomeValue: number }> {
  const whereClause = {
    ...buildWhereClause(filters),
    user_id: user.id,
  };

  const [totalExpense, totalIncome] = await prisma.$transaction([
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { ...whereClause, is_income: false },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { ...whereClause, is_income: true },
    }),
  ]);

  const totalExpenseValue =
    filters.is_income_or_expense === "income"
      ? 0
      : totalExpense._sum.amount || 0;
  const totalIncomeValue =
    filters.is_income_or_expense === "expense"
      ? 0
      : totalIncome._sum.amount || 0;

  return {
    totalExpenseValue,
    totalIncomeValue,
  };
}
