import { User } from "@prisma/client";
import { ValidatedDataInterface } from "~/shared/validated-data-interface";
import {
  AccountCreateRequestInterface,
  AccountUpdateRequestInterface,
} from "~/data/account/account-request-interfaces";
import { prisma } from "~/data/database/database.server";

export async function accountCreateValidator(
  data: AccountCreateRequestInterface,
  user: User
): Promise<ValidatedDataInterface> {
  if (!data.name) {
    return {
      isValid: false,
      errors: {
        empty: "Name can not be empty",
      },
    };
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
      isValid: false,
      errors: {
        name: "This account already exists",
      },
    };
  }

  const validCompany = prisma.company.findFirst({
    where: {
      id: data.company,
      user_id: user.id,
    },
  });

  if (validCompany === null) {
    return {
      isValid: false,
      errors: {
        name: "Invalid company",
      },
    };
  }

  return {
    isValid: true,
  };
}

export async function accountDeleteValidator(
  user: User,
  accountId: string
): Promise<ValidatedDataInterface> {
  const accountExistis = await prisma.account.findFirst({
    where: {
      id: accountId,
      user_id: user.id,
    },
  });

  if (!accountExistis) {
    return {
      isValid: false,
      errors: {
        id: "Account not found",
      },
    };
  }

  return {
    isValid: true,
  };
}

export async function accountUpdateValidator(
  data: AccountUpdateRequestInterface,
  user: User,
  accountId: string
): Promise<ValidatedDataInterface> {
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
