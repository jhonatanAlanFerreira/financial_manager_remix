import { Account, User } from "@prisma/client";
import { accountCreateValidator, accountDeleteValidator, accountUpdateValidator } from "./account-validator";
import { prisma } from "../database/database.server";
import { AccountCreateRequestInterface, AccountUpdateRequestInterface } from "./account-request-interfaces";
import ServerResponseInterface from "~/shared/server-response-interface";

export async function create(
  data: AccountCreateRequestInterface,
  user: User
): Promise<ServerResponseInterface> {
  const dataIsValid = await accountCreateValidator(data, user);

  if (!dataIsValid.isValid) {
    return {
      error: true,
      message: "There are some errors in your form",
      data: dataIsValid,
    };
  }

  const account = await prisma.account.create({
    data: {
      name: data.name,
      balance: data.balance,
      company_id: data.company || null,
      user_id: user.id,
      is_personal_account: !data.company,
    },
  });

  return {
    data: account,
    message: "Account was created successfully",
  };
}

export async function list(
  user: User,
  personalOnly = true
): Promise<ServerResponseInterface<Account[]>> {
  const userAccounts = await prisma.account.findMany({
    where: {
      user_id: user.id,
      ...(personalOnly && { is_personal_account: true }),
    },
  });

  return {
    data: userAccounts,
  };
}

export async function remove(
  classificationId: string,
  user: User
): Promise<ServerResponseInterface> {
  const dataIsValid = await accountDeleteValidator(user, classificationId);

  if (!dataIsValid.isValid) {
    return {
      error: true,
      message: "Classification not found",
      data: dataIsValid,
    };
  }

  await prisma.account.delete({
    where: {
      id: classificationId,
    },
  });

  return {
    message: "Classification removed successfully",
  };
}

export async function update(
  accountId: string,
  user: User,
  data: AccountUpdateRequestInterface
): Promise<ServerResponseInterface> {
  const dataIsValid = await accountUpdateValidator(data, user, accountId);

  if (!dataIsValid.isValid) {
    return {
      error: true,
      message: "There are some errors in your form",
      data: dataIsValid,
    };
  }

  const res = await prisma.account.update({
    data: {
      name: data.name,
      balance: data.balance,
    },
    where: {
      id: accountId,
    },
  });

  return {
    data: res,
    message: "Account was updated successfully",
  };
}
