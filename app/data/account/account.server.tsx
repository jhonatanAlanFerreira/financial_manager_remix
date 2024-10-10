import { Account, User } from "@prisma/client";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import {
  AccountCreateRequestInterface,
  AccountUpdateRequestInterface,
} from "~/data/account/account-request-interfaces";
import {
  accountCreateValidator,
  accountRemoveValidator,
  accountUpdateValidator,
} from "~/data/account/account-validator";
import { prisma } from "~/data/database/database.server";
import { AccountLoaderParamsInterface } from "./account-query-params-interfaces";

export async function create(
  data: AccountCreateRequestInterface,
  user: User
): Promise<ServerResponseInterface> {
  const serverError = await accountCreateValidator(data, user);

  if (serverError) {
    return {
      errors: serverError,
      message: "There are some errors in your form",
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
  params: AccountLoaderParamsInterface
): Promise<ServerResponseInterface<Account[]>> {
  const userAccounts = await prisma.account.findMany({
    where: {
      user_id: user.id,
      // ...(personalOnly && { is_personal_account: true }),
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
  const serverError = await accountRemoveValidator(user, classificationId);

  if (serverError) {
    return {
      errors: serverError,
      message: "Classification not found",
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
  const serverError = await accountUpdateValidator(data, user, accountId);

  if (serverError) {
    return {
      errors: serverError,
      message: "There are some errors in your form",
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
