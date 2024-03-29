import { Transaction, User } from "@prisma/client";
import ServerResponse from "~/interfaces/ServerResponse";
import { prisma } from "~/data/database.server";
import TransactionCreateRequest from "~/interfaces/bodyRequests/TransactionCreateRequest";
import TransactionCreateValidator from "./requestValidators/transactionCreateValidator";
import transactionDeleteValidator from "./requestValidators/transactionDeleteValidator";
import TransactionUpdateRequest from "~/interfaces/bodyRequests/TransactionUpdateRequest";
import transactionUpdateValidator from "./requestValidators/transactionUpdateValidator";

export async function list(user: User): Promise<ServerResponse<Transaction[]>> {
  const transactions = await prisma.transaction.findMany({
    where: {
      user_id: user.id,
    },
  });

  return {
    data: transactions,
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
    data,
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
