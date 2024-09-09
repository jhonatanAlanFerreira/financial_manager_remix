import { Account, User } from "@prisma/client";
import ServerResponse from "~/interfaces/ServerResponse";
import AccountCreateRequest from "~/interfaces/bodyRequests/account/AccountCreateRequest";
import { prisma } from "~/data/database.server";
import accountCreateValidator from "./requestValidators/account/accountCreateValidator";

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

export async function list(user: User): Promise<ServerResponse<Account[]>> {
  const userAccounts = await prisma.account.findMany({
    where: {
      user_id: user.id,
      is_personal_account: true,
    },
  });

  return {
    data: userAccounts,
  };
}
