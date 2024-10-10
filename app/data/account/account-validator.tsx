import { User } from "@prisma/client";
import {
  AccountCreateRequestInterface,
  AccountUpdateRequestInterface,
} from "~/data/account/account-request-interfaces";
import { prisma } from "~/data/database/database.server";
import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";
import { ObjectId } from "mongodb";

export async function accountCreateValidator(
  data: AccountCreateRequestInterface,
  user: User
): Promise<ServerResponseErrorInterface | null> {
  if (!data.name) {
    return {
      errorCode: 400,
      errors: {
        empty: "Name can not be empty",
      },
    };
  }

  if (isNaN(data.balance) || typeof data.balance !== "number") {
    return {
      errorCode: 400,
      errors: {
        balance: "Balance must be a valid number",
      },
    };
  }

  if (data.company) {
    if (!ObjectId.isValid(data.company)) {
      return {
        errorCode: 400,
        errors: {
          company: "Invalid company ID format",
        },
      };
    }

    const validCompany = await prisma.company.findFirst({
      where: {
        id: data.company,
        user_id: user.id,
      },
    });

    if (validCompany === null) {
      return {
        errorCode: 400,
        errors: {
          name: "Invalid company",
        },
      };
    }
  }

  const accountExists = await prisma.account.findFirst({
    where: {
      name: data.name,
      user_id: user.id,
      company_id: data.company || null,
      is_personal_account: !data.company,
    },
  });

  if (accountExists !== null) {
    return {
      errorCode: 400,
      errors: {
        name: "This account already exists",
      },
    };
  }

  return null;
}

export async function accountRemoveValidator(
  user: User,
  accountId: string
): Promise<ServerResponseErrorInterface | null> {
  const accountExistis = await prisma.account.findFirst({
    where: {
      id: accountId,
      user_id: user.id,
    },
  });

  if (!accountExistis) {
    return {
      errorCode: 404,
      errors: {
        id: "Account not found",
      },
    };
  }

  return null;
}

export async function accountUpdateValidator(
  data: AccountUpdateRequestInterface,
  user: User,
  accountId: string
): Promise<ServerResponseErrorInterface | null> {
  if (!data.name) {
    return {
      errorCode: 400,
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
      errorCode: 404,
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
      errorCode: 400,
      errors: {
        name: "This account already exists",
      },
    };
  }

  return null;
}
