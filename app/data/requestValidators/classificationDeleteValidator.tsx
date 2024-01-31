import { User } from "@prisma/client";
import ValidatedData from "~/interfaces/ValidatedData";
import { prisma } from "~/data/database.server";

export default async function classificationDeleteValidator(
  user: User,
  classificationId: string
): Promise<ValidatedData> {
  const classificationExistis =
    await prisma.transactionClassification.findFirst({
      where: {
        id: classificationId,
        user_id: user.id,
      },
    });

  if (!classificationExistis) {
    return {
      isValid: false,
      errors: {
        id: "Classification not found",
      },
    };
  }

  return {
    isValid: true,
  };
}
