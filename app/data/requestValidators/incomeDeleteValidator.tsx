import ValidatedData from "~/interfaces/ValidatedData";
import { prisma } from "~/data/database.server";
import { User } from "@prisma/client";

export default async function incomeDeleteValidator(
  user: User,
  incomeId: string
): Promise<ValidatedData> {
  const incomeExistis = await prisma.income.findFirst({
    where: {
      id: incomeId,
      user_id: user.id,
    },
  });

  if (!incomeExistis) {
    return {
      isValid: false,
      errors: {
        id: "Income not found",
      },
    };
  }

  return {
    isValid: true,
  };
}
