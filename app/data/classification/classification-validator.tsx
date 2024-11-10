import { User } from "@prisma/client";
import {
  ClassificationCreateRequestInterface,
  ClassificationUpdateRequestInterface,
} from "~/data/classification/classification-request-interfaces";
import { prisma } from "~/data/database/database.server";
import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";
import {
  validateCompanies,
  validateIdFormat,
} from "~/data/services/validators";

export async function classificationCreateValidator(
  data: ClassificationCreateRequestInterface,
  user: User
): Promise<ServerResponseErrorInterface | null> {
  if (!data.name) {
    return {
      errorCode: 400,
      errors: {
        empty: "Name can not be empty",
      },
    };
  }

  if (data.companies?.length && data.is_personal) {
    return {
      errorCode: 400,
      errors: {
        empty: "Personal classification can not have companies",
      },
    };
  }

  const classificationsExists =
    await prisma.transactionClassification.findFirst({
      where: {
        name: data.name,
        user_id: user.id,
        is_personal: data.is_personal,
        is_income: data.is_income,
      },
    });

  if (classificationsExists !== null) {
    return {
      errorCode: 400,
      errors: {
        name: "This classification already exists",
      },
    };
  }

  const companyErrors = validateCompanies(data.companies, user);
  if (companyErrors) {
    return companyErrors;
  }

  return null;
}

export async function classificationDeleteValidator(
  user: User,
  classificationId: string
): Promise<ServerResponseErrorInterface | null> {
  if (!validateIdFormat(classificationId)) {
    return {
      errorCode: 400,
      errors: {
        balance: "Invalid classification ID format",
      },
    };
  }

  const classificationExistis =
    await prisma.transactionClassification.findFirst({
      where: {
        id: classificationId,
        user_id: user.id,
      },
    });

  if (!classificationExistis) {
    return {
      errorCode: 404,
      errors: {
        id: "Classification not found",
      },
    };
  }

  return null;
}

export async function classificationUpdateValidator(
  data: ClassificationUpdateRequestInterface,
  user: User,
  classificationId: string
): Promise<ServerResponseErrorInterface | null> {
  if (!data.name) {
    return {
      errorCode: 400,
      errors: {
        empty: "Name can not be empty",
      },
    };
  }

  if (!validateIdFormat(classificationId)) {
    return {
      errorCode: 400,
      errors: {
        balance: "Invalid classification ID format",
      },
    };
  }

  if (data.companies?.length && data.is_personal) {
    return {
      errorCode: 400,
      errors: {
        empty: "Personal classification can not have companies",
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
      errorCode: 404,
      errors: {
        id: "Classification not found",
      },
    };
  }

  const companyErrors = validateCompanies(data.companies, user);
  if (companyErrors) {
    return companyErrors;
  }

  const classificationsExists =
    await prisma.transactionClassification.findFirst({
      where: {
        NOT: { id: classificationId },
        name: data.name,
        user_id: user.id,
        is_personal: data.is_personal,
        is_income: data.is_income,
      },
    });

  if (classificationsExists !== null) {
    return {
      errorCode: 400,
      errors: {
        name: "This classification already exists",
      },
    };
  }

  return null;
}
