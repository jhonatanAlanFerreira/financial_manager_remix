import { Account, Prisma, User } from "@prisma/client";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import {
  AccountCreateRequestInterface,
  AccountUpdateRequestInterface,
} from "~/data/account/account-request-interfaces";
import {
  accountCreateValidator,
  accountRemoveValidator,
  accountUpdateValidator,
  listAccountsValidator,
} from "~/data/account/account-validator";
import { prisma } from "~/data/database/database.server";
import { AccountLoaderParamsInterface } from "./account-query-params-interfaces";

type AccountWhereInput = Prisma.AccountWhereInput;

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
  const serverError = await listAccountsValidator(params, user);

  if (serverError) {
    return {
      errors: serverError,
      message: "There are some invalid params",
    };
  }

  const take = params.pageSize != "all" ? params.pageSize : undefined;
  const skip =
    params.pageSize != "all" ? (params.page - 1) * params.pageSize : undefined;

  const whereClause: AccountWhereInput = {
    user_id: user.id,
  };

  whereClause.is_personal_account =
    params.is_personal_or_company !== "all"
      ? params.is_personal_or_company === "personal"
      : undefined;

  if (params.name) {
    whereClause.name = { contains: params.name, mode: "insensitive" };
  }

  if (params.company) {
    whereClause.company_id = params.company;
  }

  const accounts = await prisma.account.findMany({
    where: whereClause,
    skip,
    take,
  });

  const totalData = await prisma.account.count({
    where: whereClause,
  });

  const totalPages =
    params.pageSize != "all" ? Math.ceil(totalData / params.pageSize) : 1;
  const pageSize = params.pageSize != "all" ? params.pageSize : totalData;

  return {
    data: accounts,
    pageInfo: {
      currentPage: params.page,
      pageSize,
      totalData,
      totalPages,
    },
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
