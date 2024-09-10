import { User } from "@prisma/client";
import ValidatedData from "~/interfaces/ValidatedData";
import { prisma } from "~/data/database.server";

export default async function accountDeleteValidator(
  user: User,
  accountId: string
): Promise<ValidatedData> {
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
