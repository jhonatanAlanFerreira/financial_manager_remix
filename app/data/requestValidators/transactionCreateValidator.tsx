import { User } from "@prisma/client";
import ValidatedData from "~/interfaces/ValidatedData";
import TransactionCreateRequest from "~/interfaces/bodyRequests/TransactionCreateRequest";
import { prisma } from "~/data/database.server";

export default async function (
  data: TransactionCreateRequest,
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

  const validClassification = data.transaction_classification_id
    ? prisma.transactionClassification.findFirst({
        where: {
          id: data.transaction_classification_id,
          user_id: user.id,
        },
      })
    : true;

  const ValidTransactionData = (
    await Promise.all([validCompany, validExpense, validClassification])
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
