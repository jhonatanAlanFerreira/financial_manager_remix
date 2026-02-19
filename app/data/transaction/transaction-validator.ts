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
import { TransactionLoaderParamsInterface } from "~/data/transaction/transaction-query-params-interfaces";

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

  if (!data.date) {
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
        is_personal: "Persoanl transaction can not have company",
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
        expense: "Invalid expense",
      },
    };
  }

  if (!validateIdFormat(data.merchant)) {
    return {
      errorCode: 400,
      errors: {
        merchant: "Invalid merchant ID format",
      },
    };
  }

  const validMerchant = data.merchant
    ? prisma.merchant.findFirst({
        where: {
          id: data.merchant,
          user_id: user.id,
        },
      })
    : true;

  if (!validMerchant) {
    return {
      errorCode: 400,
      errors: {
        merchant: "Invalid merchant",
      },
    };
  }

  if (!validateIdFormat(data.income)) {
    return {
      errorCode: 400,
      errors: {
        income: "Invalid income ID format",
      },
    };
  }

  const validIncome = data.income
    ? prisma.income.findFirst({
        where: {
          id: data.income,
          user_id: user.id,
        },
      })
    : true;

  if (!validIncome) {
    return {
      errorCode: 400,
      errors: {
        income: "Invalid income",
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
): Promise<ServerResponseErrorInterface | null> {
  if (!validateIdFormat(transactionId)) {
    return {
      errorCode: 400,
      errors: {
        transactionId: "Invalid Transaction ID format",
      },
    };
  }

  const transactionExistis = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      user_id: user.id,
    },
  });

  if (!transactionExistis) {
    return {
      errorCode: 404,
      errors: {
        transactionId: "Transaction not found",
      },
    };
  }

  return null;
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
        transactionId: "Invalid transaction ID format",
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

  if (!data.date) {
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
        is_personal: "Persoanl transaction can not have company",
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
        transactionId: "Transaction not found",
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
        expense: "Invalid expense",
      },
    };
  }

  if (!validateIdFormat(data.merchant)) {
    return {
      errorCode: 400,
      errors: {
        merchant: "Invalid merchant ID format",
      },
    };
  }

  const validMerchant = data.merchant
    ? prisma.merchant.findFirst({
        where: {
          id: data.merchant,
          user_id: user.id,
        },
      })
    : true;

  if (!validMerchant) {
    return {
      errorCode: 400,
      errors: {
        merchant: "Invalid merchant",
      },
    };
  }

  if (!validateIdFormat(data.income)) {
    return {
      errorCode: 400,
      errors: {
        income: "Invalid income ID format",
      },
    };
  }

  const validIncome = data.income
    ? prisma.income.findFirst({
        where: {
          id: data.income,
          user_id: user.id,
        },
      })
    : true;

  if (!validIncome) {
    return {
      errorCode: 400,
      errors: {
        income: "Invalid income",
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

export async function transactionListValidator(
  params: TransactionLoaderParamsInterface,
  user: User
): Promise<ServerResponseErrorInterface | null> {
  if (!validateIdFormat(params.account)) {
    return {
      errorCode: 400,
      errors: {
        account: "Invalid Account ID format",
      },
    };
  }

  if (!validateIdFormat(params.company)) {
    return {
      errorCode: 400,
      errors: {
        company: "Invalid company ID format",
      },
    };
  }

  if (!validateIdFormat(params.expense)) {
    return {
      errorCode: 400,
      errors: {
        expense: "Invalid expense ID format",
      },
    };
  }

  if (!validateIdFormat(params.merchant)) {
    return {
      errorCode: 400,
      errors: {
        merchant: "Invalid merchant ID format",
      },
    };
  }

  if (!validateIdFormat(params.has_classification)) {
    return {
      errorCode: 400,
      errors: {
        classification: "Invalid classification ID format",
      },
    };
  }

  if (
    params.sort_key &&
    ![
      "date",
      "name",
      "amount",
      "company",
      "expense",
      "income",
      "merchant",
      "is_personal_or_company",
      "is_income_or_expense",
    ].includes(params.sort_key)
  ) {
    return {
      errorCode: 400,
      errors: {
        sort_key: `${params.sort_key} is not a valid key`,
      },
    };
  }

  return null;
}
