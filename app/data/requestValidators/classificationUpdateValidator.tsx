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

  const classification = await prisma.transactionClassification.findFirst({
    where: {
      id: classificationId,
      user_id: user.id,
    },
  });

  if (!classification) {
    return {
      isValid: false,
      errors: {
        id: "Classification not found",
      },
    };
  }

  if (data.company_id) {
    const companyFromSameUser = await prisma.company.findFirst({
      where: {
        id: data.company_id,
        user_id: user.id,
      },
    });
    if (!companyFromSameUser) {
      return {
        isValid: false,
        errors: {
          company_id: "Company does not exist",
        },
      };
    }
  }

  return {
    isValid: true,
  };
}
