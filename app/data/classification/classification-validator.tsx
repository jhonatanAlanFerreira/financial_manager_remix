import { User } from "@prisma/client";
import ValidatedData from "~/interfaces/ValidatedData";
import { prisma } from "../database/database.server";
import { ClassificationCreateRequestInterface, ClassificationUpdateRequestInterface } from "./Classification-request-interfaces";

export default async function classificationCreateValidator(
  data: ClassificationCreateRequestInterface,
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

  if (data.companies?.length) {
    const companiesFromSameUser = await prisma.company.findMany({
      where: {
        id: {
          in: data.companies,
        },
        user_id: user.id,
      },
    });
    if (companiesFromSameUser.length != data.companies.length) {
      return {
        isValid: false,
        errors: {
          company_ids: "There are some invalid companies",
        },
      };
    }
  }

  return {
    isValid: true,
  };
}

export async function classificationDeleteValidator(
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

export async function classificationUpdateValidator(
  data: ClassificationUpdateRequestInterface,
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

  if (data.companies?.length) {
    const companiesFromSameUser = await prisma.company.findMany({
      where: {
        id: {
          in: data.companies,
        },
        user_id: user.id,
      },
    });
    if (companiesFromSameUser.length != data.companies.length) {
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