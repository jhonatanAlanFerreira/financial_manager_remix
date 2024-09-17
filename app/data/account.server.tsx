import { Account, User } from "@prisma/client";
import ServerResponse from "~/interfaces/ServerResponse";
import AccountCreateRequest from "~/interfaces/bodyRequests/account/AccountCreateRequest";
import { prisma } from "~/data/database.server";
import accountCreateValidator from "~/data/requestValidators/account/accountCreateValidator";
import accountDeleteValidator from "~/data/requestValidators/account/accountDeleteValidator";
import AccountUpdateRequest from "~/interfaces/bodyRequests/account/AccountUpdateRequest";
import accountUpdateValidator from "./requestValidators/account/accountUpdateValidator";

export async function create(
  data: AccountCreateRequest,
  user: User
): Promise<ServerResponse> {
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
): Promise<ServerResponse<Account[]>> {
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
): Promise<ServerResponse> {
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
  data: AccountUpdateRequest
): Promise<ServerResponse> {
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
