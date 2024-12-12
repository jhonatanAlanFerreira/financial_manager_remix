import { User } from "@prisma/client";
import {
  ClassificationCreateRequestInterface,
  ClassificationUpdateRequestInterface,
} from "~/data/classification/classification-request-interfaces";
import { prisma } from "~/data/database/database.server";
import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";
import {
  validateCompanies,
  validateCompany,
  validateIdFormat,
  validatePaginationParams,
} from "~/data/services/validators";
import { ClassificationLoaderParamsInterface } from "./classification-query-params-interfaces";

export async function classificationCreateValidator(
  data: ClassificationCreateRequestInterface,
  user: User
): Promise<ServerResponseErrorInterface | null> {
  if (!data.name) {
    return {
      errorCode: 400,
      errors: {
        name: "Name can not be empty",
      },
    };
  }

  if (data.companies?.length && data.is_personal) {
    return {
      errorCode: 400,
      errors: {
        is_personal: "Personal classification can not have companies",
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

  const companyErrors = await validateCompanies(data.companies, user);
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
        classificationId: "Invalid classification ID format",
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
        classificationId: "Classification not found",
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
        name: "Name can not be empty",
      },
    };
  }

  if (!validateIdFormat(classificationId)) {
    return {
      errorCode: 400,
      errors: {
        classificationId: "Invalid classification ID format",
      },
    };
  }

  if (data.companies?.length && data.is_personal) {
    return {
      errorCode: 400,
      errors: {
        is_personal: "Personal classification can not have companies",
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
        classificationId: "Classification not found",
      },
    };
  }

  const companyErrors = await validateCompanies(data.companies, user);
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

export async function listClassificationsValidator(
  params: ClassificationLoaderParamsInterface,
  user: User
): Promise<ServerResponseErrorInterface | null> {
  const paginationErrors = validatePaginationParams(params);
  if (paginationErrors) {
    return paginationErrors;
  }

  const companyErrors = validateCompany(params.has_company, user);
  if (companyErrors) {
    return companyErrors;
  }

  return null;
}
