import { User } from "@prisma/client";
import {
  ClassificationCreateRequestInterface,
  ClassificationUpdateRequestInterface,
} from "~/data/classification/classification-request-interfaces";
import { prisma } from "~/data/database/database.server";
import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";
import { validateCompanies } from "~/data/services/validators";

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
): Promise<any> {
  //WIP
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
): Promise<any> {
  //WIP
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
