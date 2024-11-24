import { User } from "@prisma/client";
import {
  AccountCreateRequestInterface,
  AccountUpdateRequestInterface,
} from "~/data/account/account-request-interfaces";
import { prisma } from "~/data/database/database.server";
import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";
import { AccountLoaderParamsInterface } from "~/data/account/account-query-params-interfaces";
import {
  validateCompany,
  validateIdFormat,
  validateNumber,
  validatePaginationParams,
} from "~/data/services/validators";

export async function accountCreateValidator(
  data: AccountCreateRequestInterface,
  user: User
): Promise<ServerResponseErrorInterface | null> {
  if (!data.name) {
    return {
      errorCode: 400,
      errors: {
        name: "Name can not be empty",
      },
    };
  }

  if (!validateNumber(data.balance)) {
    return {
      errorCode: 400,
      errors: {
        balance: "Balance must be a valid number",
      },
    };
  }

  const companyErrors = await validateCompany(data.company, user);
  if (companyErrors) {
    return companyErrors;
  }

  const accountExists = await prisma.account.findFirst({
    where: {
      name: data.name,
      user_id: user.id,
      company_id: data.company || null,
      is_personal: !data.company,
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
  if (!validateIdFormat(accountId)) {
    return {
      errorCode: 400,
      errors: {
        accountId: "Invalid account ID format",
      },
    };
  }

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
        accountId: "Account not found",
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
  if (!validateIdFormat(accountId)) {
    return {
      errorCode: 400,
      errors: {
        accountId: "Invalid account ID format",
      },
    };
  }

  if (!validateNumber(data.balance)) {
    return {
      errorCode: 400,
      errors: {
        balance: "Balance must be a valid number",
      },
    };
  }

  if (!data.name) {
    return {
      errorCode: 400,
      errors: {
        name: "Name can not be empty",
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
        accountId: "Account not found",
      },
    };
  }

  const accountExists = await prisma.account.findFirst({
    where: {
      name: data.name,
      user_id: user.id,
      company_id: account.company_id,
      is_personal: account.is_personal,
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

export async function listAccountsValidator(
  params: AccountLoaderParamsInterface,
  user: User
): Promise<ServerResponseErrorInterface | null> {
  const paginationErrors = validatePaginationParams(params);
  if (paginationErrors) {
    return paginationErrors;
  }

  const companyErrors = await validateCompany(params.company, user);
  if (companyErrors) {
    return companyErrors;
  }

  return null;
}
