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
} from "~/data/transaction/transaction-Validator";
import { paginate } from "~/data/services/list.service";

export async function list(
  user: User,
  params: TransactionLoaderParamsInterface
): Promise<ServerResponseInterface<Transaction[]>> {
  const serverError = await transactionListValidator(params, user);

  if (serverError) {
    return {
      serverError,
      message: "There are some invalid params",
    };
  }

  const { page, pageSize, ...restParams } = params;

  return paginate<
    Transaction,
    Prisma.TransactionFindManyArgs,
    Prisma.TransactionCountArgs
  >(
    prisma.transaction.findMany,
    prisma.transaction.count,
    { page, pageSize },
    restParams,
    { user_id: user.id }
  );
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
      transaction_date: data.transaction_date,
      company_id: data.company,
      account_id: data.account,
      expense_id: data.expense,
      income_id: data.income,
      is_income: data.is_income,
      is_personal: data.is_personal,
      transaction_classification_ids: data.classifications,
      user_id: user.id,
    },
  });

  await prisma.account.update({
    where: { id: data.account },
    data: { balance: newBalance },
  });

  return {
    data: transaction,
    message: "Transaction was created successfully",
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

  await prisma.account.update({
    where: { id: transaction?.account_id },
    data: {
      balance: {
        increment: transaction?.is_income
          ? -transaction?.amount
          : transaction?.amount,
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
        increment: adjustment,
      },
    },
  });

  const updatedTransaction = await prisma.transaction.update({
    data: {
      name: data.name,
      amount: data.amount,
      transaction_date: data.transaction_date,
      company_id: data.company,
      expense_id: data.expense,
      income_id: data.income,
      is_income: data.is_income,
      is_personal: data.is_personal,
      transaction_classification_ids: data.classifications,
    },
    where: { id: transactionId },
  });

  return {
    data: updatedTransaction,
    message: "Transaction was updated successfully",
  };
}
