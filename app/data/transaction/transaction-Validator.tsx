import { User } from "@prisma/client";
import ValidatedData from "~/interfaces/ValidatedData";
import { prisma } from "../database/database.server";
import { TransactionCreateRequestInterface, TransactionUpdateRequestInterface } from "./transaction-request-interfaces";

export async function transactionCreateValidator (
  data: TransactionCreateRequestInterface,
  user: User
): Promise<ValidatedData> {
  if (!data.name) {
    return {
      isValid: false,
      errors: {
        name: "Name can not be empty",
      },
    };
  }

  if (!data.transaction_date) {
    return {
      isValid: false,
      errors: {
        date: "Date can not be empty",
      },
    };
  }

  if (!data.amount) {
    return {
      isValid: false,
      errors: {
        amount: "Amount can not be empty",
      },
    };
  }

  const validCompany = data.company
    ? prisma.company.findFirst({
        where: {
          id: data.company,
          user_id: user.id,
        },
      })
    : true;

  const validExpense = data.expense
    ? prisma.expense.findFirst({
        where: {
          id: data.expense,
          user_id: user.id,
        },
      })
    : true;

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

  const ValidTransactionData = (
    await Promise.all([validCompany, validExpense, validClassifications])
  ).every((isValid) => isValid);

  if (!ValidTransactionData) {
    return {
      isValid: false,
      errors: {
        invalid_fields: "There are invalid fields",
      },
    };
  }

  return {
    isValid: true,
  };
}

export async function transactionDeleteValidator(
  user: User,
  transactionId: string
): Promise<ValidatedData> {
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
): Promise<ValidatedData> {
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      user_id: user.id,
    },
  });

  if (!transaction) {
    return {
      isValid: false,
      errors: {
        id: "Transaction not found",
      },
    };
  }

  if (!data.name) {
    return {
      isValid: false,
      errors: {
        name: "Name can not be empty",
      },
    };
  }

  if (!data.transaction_date) {
    return {
      isValid: false,
      errors: {
        date: "Date can not be empty",
      },
    };
  }

  if (!data.amount) {
    return {
      isValid: false,
      errors: {
        amount: "Amount can not be empty",
      },
    };
  }

  const validCompany = data.company
    ? prisma.company.findFirst({
        where: {
          id: data.company,
          user_id: user.id,
        },
      })
    : true;

  const validExpense = data.expense
    ? prisma.expense.findFirst({
        where: {
          id: data.expense,
          user_id: user.id,
        },
      })
    : true;

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

  const ValidTransactionData = (
    await Promise.all([validCompany, validExpense, validClassifications])
  ).every((isValid) => isValid);

  if (!ValidTransactionData) {
    return {
      isValid: false,
      errors: {
        invalid_fields: "There are invalid fields",
      },
    };
  }

  return {
    isValid: true,
  };
}