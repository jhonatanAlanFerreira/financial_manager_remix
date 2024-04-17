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

  if (data.company_ids?.length) {
    const companiesFromSameUser = await prisma.company.findMany({
      where: {
        id: {
          in: data.company_ids,
        },
        user_id: user.id,
      },
    });
    if (companiesFromSameUser.length != data.company_ids.length) {
      return {
        isValid: false,
        errors: {
          company_ids: "There are some invalid companies",
        },
      };
    }
  }

  const classificationsExists =
    await prisma.transactionClassification.findUnique({
      where: {
        NOT: { id: classificationId },
        user_id_name_is_personal_transaction_classification_is_income: {
          name: data.name,
          user_id: user.id,
          is_personal_transaction_classification:
            data.is_personal_transaction_classification,
          is_income: data.is_income,
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
