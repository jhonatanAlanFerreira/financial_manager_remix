import { User } from "@prisma/client";
import { ValidatedDataInterface } from "~/shared/validated-data-interface";
import {
  ClassificationCreateRequestInterface,
  ClassificationUpdateRequestInterface,
} from "~/data/classification/classification-request-interfaces";
import { prisma } from "~/data/database/database.server";

export async function classificationCreateValidator(
  data: ClassificationCreateRequestInterface,
  user: User
): Promise<ValidatedDataInterface> {
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
): Promise<ValidatedDataInterface> {
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
): Promise<ValidatedDataInterface> {
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
