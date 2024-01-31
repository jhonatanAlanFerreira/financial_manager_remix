import { User } from "@prisma/client";
import ValidatedData from "~/interfaces/ValidatedData";
import ClassificationCreateRequest from "~/interfaces/bodyRequests/ClassificationCreateRequest";
import { prisma } from "~/data/database.server";

export default async function classificationCreateValidator(
  data: ClassificationCreateRequest,
  user: User
): Promise<ValidatedData> {
  if (!data.name) {
    return {
      isValid: false,
      errors: {
        empty: "Name can not be empty",
      },
    };
  }

  const classificationsExists =
    await prisma.transactionClassification.findUnique({
      where: {
        user_id_name: {
          name: data.name,
          user_id: user.id,
        },
      },
    });

  if (classificationsExists !== null) {
    return {
      isValid: false,
      errors: {
        name: "This classification already exists",
      },
    };
  }

  return {
    isValid: true,
  };
}
