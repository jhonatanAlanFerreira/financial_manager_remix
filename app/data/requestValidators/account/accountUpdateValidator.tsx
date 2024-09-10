import { User } from "@prisma/client";
import ValidatedData from "~/interfaces/ValidatedData";
import { prisma } from "~/data/database.server";
import AccountUpdateRequest from "~/interfaces/bodyRequests/account/AccountUpdateRequest";

export default async function accountUpdateValidator(
  data: AccountUpdateRequest,
  user: User,
  accountId: string
): Promise<ValidatedData> {
  if (!data.name) {
    return {
      isValid: false,
      errors: {
        empty: "Name can not be empty",
      },
    };
  }

  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      user_id: user.id,
    },
  });

  if (!account) {
    return {
      isValid: false,
      errors: {
        id: "Account not found",
      },
    };
  }

  const accountExists = await prisma.account.findFirst({
    where: {
      name: data.name,
      user_id: user.id,
      company_id: account.company_id,
      is_personal_account: account.is_personal_account,
      NOT: {
        id: accountId,
      },
    },
  });

  if (accountExists !== null) {
    return {
      isValid: false,
      errors: {
        name: "This account already exists",
      },
    };
  }

  return {
    isValid: true,
  };
}
