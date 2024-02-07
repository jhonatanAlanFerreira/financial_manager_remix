import { Transaction, User } from "@prisma/client";
import ServerResponse from "~/interfaces/ServerResponse";
import { prisma } from "~/data/database.server";
import TransactionCreateRequest from "~/interfaces/bodyRequests/TransactionCreateRequest";
import TransactionCreateValidator from "./requestValidators/transactionCreateValidator";
import transactionDeleteValidator from "./requestValidators/transactionDeleteValidator";
import TransactionUpdateRequest from "~/interfaces/bodyRequests/TransactionUpdateRequest";
import transactionUpdateValidator from "./requestValidators/transactionUpdateValidator";

export async function list(user: User): Promise<ServerResponse<Transaction[]>> {
  const classifications = await prisma.transaction.findMany({
    where: {
      user_id: user.id,
    },
  });

  return {
    data: classifications,
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

  const expense = await prisma.transaction.create({
    data: {
      name: data.name,
      amount: data.amount,
      user_id: user.id,
      transaction_date: data.transaction_date,
      company_id: data.company_id,
      transaction_classification_id: data.transaction_classification_id,
      expense_id: data.expense_id,
    },
  });

  return {
    data: expense,
    message: "Expense was created successfully",
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
    data,
    where: {
      id: transactionId,
    },
  });

  return {
    data: res,
    message: "Transaction was updated successfully",
  };
}
