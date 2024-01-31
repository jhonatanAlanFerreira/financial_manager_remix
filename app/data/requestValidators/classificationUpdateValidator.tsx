import { User } from "@prisma/client";
import ValidatedData from "~/interfaces/ValidatedData";
import ClassificationUpdateRequest from "~/interfaces/bodyRequests/ClassificationUpdateRequest";
import { prisma } from "~/data/database.server";

export default async function classificationUpdateValidator(
  data: ClassificationUpdateRequest,
  user: User,
  classificationId: string
): Promise<ValidatedData> {
  if (!data.name) {
    return {
      isValid: false,
      errors: {
        empty: "Name can not be empty",
      },
    };
  }

  const company = await prisma.transactionClassification.findFirst({
    where: {
      id: classificationId,
      user_id: user.id,
    },
  });

  if (!company) {
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
