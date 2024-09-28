import { Prisma, Transaction, User } from "@prisma/client";
import ServerResponse from "~/interfaces/ServerResponse";
import { prisma } from "~/data/database/database.server";
import TransactionCreateRequest from "~/interfaces/bodyRequests/transaction/TransactionCreateRequest";
import TransactionUpdateRequest from "~/interfaces/bodyRequests/transaction/TransactionUpdateRequest";
import TransactionLoaderParams from "~/interfaces/queryParams/transaction/TransactionLoaderParams";
import TransactionsWithTotals from "~/interfaces/pageComponents/transactions/transactions-with-totals";
import { transactionCreateValidator, transactionDeleteValidator, transactionUpdateValidator } from "./transaction-Validator";

type TransactionWhereInput = Prisma.TransactionWhereInput;

export async function list(
  user: User,
  params: TransactionLoaderParams
): Promise<ServerResponse<TransactionsWithTotals>> {
  const take = params.pageSize != "all" ? params.pageSize : undefined;
  const skip =
    params.pageSize != "all" ? (params.page - 1) * params.pageSize : undefined;

  const whereClause: TransactionWhereInput = {
    user_id: user.id,
    is_personal_transaction:
      params.is_personal_or_company !== "all"
        ? params.is_personal_or_company === "personal"
        : undefined,
    is_income:
      params.is_income_or_expense !== "all"
        ? params.is_income_or_expense === "income"
        : undefined,
    name: params.name
      ? { contains: params.name, mode: "insensitive" }
      : undefined,
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

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    skip,
    take,
  });

  const totalExpenseValue = totalExpense._sum.amount || 0;
  const totalIncomeValue = totalIncome._sum.amount || 0;

  const finalExpenseValue =
    params.is_income_or_expense === "income" ? 0 : totalExpenseValue;
  const finalIncomeValue =
    params.is_income_or_expense === "expense" ? 0 : totalIncomeValue;

  const totalPages =
    params.pageSize != "all" ? Math.ceil(totalData / params.pageSize) : 1;
  const pageSize = params.pageSize != "all" ? params.pageSize : totalData;

  return {
    data: {
      transactions,
      totalExpenseValue: finalExpenseValue,
      totalIncomeValue: finalIncomeValue,
    },
    pageInfo: {
      currentPage: params.page,
      pageSize,
      totalData,
      totalPages,
    },
  };
}

export async function create(
  data: TransactionCreateRequest,
  user: User
): Promise<ServerResponse> {
  const dataIsValid = await transactionCreateValidator(data, user);

  if (!dataIsValid.isValid) {
    return {
      error: true,
      message: "There are some errors in your form",
      data: dataIsValid,
    };
  }

  const account = await prisma.account.findUnique({
    where: { id: data.account },
  });

  if (!account) {
    return {
      error: true,
      message: "Account not found",
    };
  }

  let newBalance = account.balance || 0;
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
      is_personal_transaction: data.is_personal_transaction,
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
): Promise<ServerResponse> {
  const dataIsValid = await transactionDeleteValidator(user, transactionId);

  if (!dataIsValid.isValid) {
    return {
      error: true,
      message: "Transaction not found",
      data: dataIsValid,
    };
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    return {
      error: true,
      message: "Transaction not found",
    };
  }

  await prisma.account.update({
    where: { id: transaction.account_id },
    data: {
      balance: {
        increment: transaction.is_income
          ? -transaction.amount
          : transaction.amount,
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

  const existingTransaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!existingTransaction) {
    return {
      error: true,
      message: "Transaction not found",
    };
  }

  const adjustmentAmount = data.amount - existingTransaction.amount;
  const adjustment = existingTransaction.is_income
    ? adjustmentAmount
    : -adjustmentAmount;

  await prisma.account.update({
    where: { id: existingTransaction.account_id },
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
      is_personal_transaction: data.is_personal_transaction,
      transaction_classification_ids: data.classifications,
    },
    where: { id: transactionId },
  });

  return {
    data: updatedTransaction,
    message: "Transaction was updated successfully",
  };
}
