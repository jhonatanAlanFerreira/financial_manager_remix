import { User } from "@prisma/client";
import ValidatedData from "~/interfaces/ValidatedData";
import { prisma } from "~/data/database.server";
import TransactionUpdateRequest from "~/interfaces/bodyRequests/TransactionUpdateRequest";

export default async function (
  transactionId: string,
  user: User,
  data: TransactionUpdateRequest
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

  const validCompany = data.company_id
    ? prisma.company.findFirst({
        where: {
          id: data.company_id,
          user_id: user.id,
        },
      })
    : true;

  const validExpense = data.expense_id
    ? prisma.expense.findFirst({
        where: {
          id: data.expense_id,
          user_id: user.id,
        },
      })
    : true;

  let validClassifications = true;
  if (data.transaction_classification_ids?.length) {
    const classificationsFromSameUser =
      await prisma.transactionClassification.findMany({
        where: {
          id: {
            in: data.transaction_classification_ids,
          },
          user_id: user.id,
        },
      });
    validClassifications =
      classificationsFromSameUser.length ==
      data.transaction_classification_ids.length;
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
