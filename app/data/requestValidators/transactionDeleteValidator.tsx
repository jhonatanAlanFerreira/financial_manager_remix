import { User } from "@prisma/client";
import ValidatedData from "~/interfaces/ValidatedData";
import { prisma } from "~/data/database.server";

export default async function transactionDeleteValidator(
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
