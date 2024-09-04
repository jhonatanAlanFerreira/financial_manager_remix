import { User } from "@prisma/client";
import ServerResponse from "~/interfaces/ServerResponse";
import AccountCreateRequest from "~/interfaces/bodyRequests/account/AccountCreateRequest";
import { prisma } from "~/data/database.server";

export async function create(
  data: AccountCreateRequest,
  user: User
): Promise<ServerResponse> {
  //   const dataIsValid = await accountCreateValidator(data, user);

  //   if (!dataIsValid.isValid) {
  //     return {
  //       error: true,
  //       message: "There are some errors in your form",
  //       data: dataIsValid,
  //     };
  //   }

  const account = await prisma.account.create({
    data: {
      name: data.name,
      balance: data.balance,
      company_id: data.company,
      user_id: user.id,
    },
  });

  return {
    data: account,
    message: "Account was created successfully",
  };
}
