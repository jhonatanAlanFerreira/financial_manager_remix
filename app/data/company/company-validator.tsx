import { User } from "@prisma/client";
import { prisma } from "../database/database.server";
import { CompanyCreateRequestInterface, CompanyUpdateRequestInterface } from "./company-request-interfaces";
import ValidatedDataInterface from "~/shared/validated-data-interface";

export async function companyCreateValidator(
  data: CompanyCreateRequestInterface,
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

  const companyExists = await prisma.company.findUnique({
    where: {
      user_id_name: {
        name: data.name,
        user_id: user.id,
      },
    },
  });

  if (companyExists !== null) {
    return {
      isValid: false,
      errors: {
        name: "This company already exists",
      },
    };
  }

  return {
    isValid: true,
  };
}

export async function companyDeleteValidator(
  user: User,
  companyId: string
): Promise<ValidatedDataInterface> {
  const companyExistis = await prisma.company.findFirst({
    where: {
      id: companyId,
      user_id: user.id,
    },
  });

  if (!companyExistis) {
    return {
      isValid: false,
      errors: {
        id: "Company not found",
      },
    };
  }

  return {
    isValid: true,
  };
}

export async function companyUpdateValidator(
  data: CompanyUpdateRequestInterface,
  user: User,
  companyId: string
): Promise<ValidatedDataInterface> {
  if (!data.name) {
    return {
      isValid: false,
      errors: {
        empty: "Name can not be empty",
      },
    };
  }

  const company = await prisma.company.findFirst({
    where: {
      id: companyId,
      user_id: user.id,
    },
  });

  if (!company) {
    return {
      isValid: false,
      errors: {
        id: "Company not found",
      },
    };
  }

  const companyExists = await prisma.company.findUnique({
    where: {
      NOT: { id: companyId },
      user_id_name: {
        name: data.name,
        user_id: user.id,
      },
    },
  });

  if (companyExists !== null) {
    return {
      isValid: false,
      errors: {
        name: "This company already exists",
      },
    };
  }

  return {
    isValid: true,
  };
}