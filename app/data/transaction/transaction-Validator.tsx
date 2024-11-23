import { User } from "@prisma/client";

import {
  TransactionCreateRequestInterface,
  TransactionUpdateRequestInterface,
} from "~/data/transaction/transaction-request-interfaces";
import { prisma } from "~/data/database/database.server";
import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";
import {
  validateCompany,
  validateIdFormat,
  validateMultipleIdsFormat,
  validateNumber,
} from "~/data/services/validators";

export async function transactionCreateValidator(
  data: TransactionCreateRequestInterface,
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

  if (!data.transaction_date) {
    return {
      errorCode: 400,
      errors: {
        date: "Date can not be empty",
      },
    };
  }

  if (!data.amount) {
    return {
      errorCode: 400,
      errors: {
        amount: "Amount can not be empty",
      },
    };
  }

  if (!validateNumber(data.amount)) {
    return {
      errorCode: 400,
      errors: {
        amount: "Amount must be a valid number",
      },
    };
  }

  if (!validateIdFormat(data.account)) {
    return {
      errorCode: 400,
      errors: {
        account: "Invalid Account ID format",
      },
    };
  }

  if (data.is_personal && data.company) {
    return {
      errorCode: 400,
      errors: {
        amount: "Persoanl transaction can not have company",
      },
    };
  }

  const account = await prisma.account.findUnique({
    where: { id: data.account, user_id: user.id },
  });

  if (!account) {
    return {
      errorCode: 404,
      errors: {
        account: "Account not found",
      },
    };
  }

  const companyErrors = await validateCompany(data.company, user);
  if (companyErrors) {
    return companyErrors;
  }

  if (!validateIdFormat(data.expense)) {
    return {
      errorCode: 400,
      errors: {
        expense: "Invalid expense ID format",
      },
    };
  }

  const validExpense = data.expense
    ? prisma.expense.findFirst({
        where: {
          id: data.expense,
          user_id: user.id,
        },
      })
    : true;

  if (!validExpense) {
    return {
      errorCode: 400,
      errors: {
        expenses: "Invalid expense",
      },
    };
  }

  if (!validateMultipleIdsFormat(data.classifications)) {
    return {
      errorCode: 400,
      errors: {
        classifications: "There are some invalid classification ID formats",
      },
    };
  }

  let validClassifications = true;
  if (data.classifications?.length) {
    const classificationsFromSameUser =
      await prisma.transactionClassification.findMany({
        where: {
          id: {
            in: data.classifications,
          },
          user_id: user.id,
        },
      });
    validClassifications =
      classificationsFromSameUser.length == data.classifications.length;
  }

  if (!validClassifications) {
    return {
      errorCode: 400,
      errors: {
        classifications: "There are some invalid classifications",
      },
    };
  }

  return null;
}

export async function transactionDeleteValidator(
  user: User,
  transactionId: string
): Promise<any> {
  //WIP
  const transactionExistis = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      user_id: user.id,
    },
  });

  if (!transactionExistis) {
    return {
      isValid: false,
      errors: {
        id: "Transaction not found",
      },
    };
  }

  return {
    isValid: true,
  };
}

export async function transactionUpdateValidator(
  transactionId: string,
  user: User,
  data: TransactionUpdateRequestInterface
): Promise<ServerResponseErrorInterface | null> {
  if (!validateIdFormat(transactionId)) {
    return {
      errorCode: 400,
      errors: {
        balance: "Invalid transaction ID format",
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

  if (!data.transaction_date) {
    return {
      errorCode: 400,
      errors: {
        date: "Date can not be empty",
      },
    };
  }

  if (!data.amount) {
    return {
      errorCode: 400,
      errors: {
        amount: "Amount can not be empty",
      },
    };
  }

  if (data.is_personal && data.company) {
    return {
      errorCode: 400,
      errors: {
        amount: "Persoanl transaction can not have company",
      },
    };
  }

  if (!validateNumber(data.amount)) {
    return {
      errorCode: 400,
      errors: {
        amount: "Amount must be a valid number",
      },
    };
  }

  if (!validateIdFormat(data.account)) {
    return {
      errorCode: 400,
      errors: {
        account: "Invalid Account ID format",
      },
    };
  }

  const account = await prisma.account.findUnique({
    where: { id: data.account, user_id: user.id },
  });

  if (!account) {
    return {
      errorCode: 404,
      errors: {
        account: "Account not found",
      },
    };
  }

  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      user_id: user.id,
    },
  });

  if (!transaction) {
    return {
      errorCode: 404,
      errors: {
        id: "Transaction not found",
      },
    };
  }

  const companyErrors = await validateCompany(data.company, user);
  if (companyErrors) {
    return companyErrors;
  }

  if (!validateIdFormat(data.expense)) {
    return {
      errorCode: 400,
      errors: {
        expense: "Invalid expense ID format",
      },
    };
  }

  const validExpense = data.expense
    ? prisma.expense.findFirst({
        where: {
          id: data.expense,
          user_id: user.id,
        },
      })
    : true;

  if (!validExpense) {
    return {
      errorCode: 400,
      errors: {
        expenses: "Invalid expense",
      },
    };
  }

  if (!validateMultipleIdsFormat(data.classifications)) {
    return {
      errorCode: 400,
      errors: {
        classifications: "There are some invalid classification ID formats",
      },
    };
  }

  let validClassifications = true;
  if (data.classifications?.length) {
    const classificationsFromSameUser =
      await prisma.transactionClassification.findMany({
        where: {
          id: {
            in: data.classifications,
          },
          user_id: user.id,
        },
      });
    validClassifications =
      classificationsFromSameUser.length == data.classifications.length;
  }

  if (!validClassifications) {
    return {
      errorCode: 400,
      errors: {
        classifications: "There are some invalid classifications",
      },
    };
  }
  return null;
}
