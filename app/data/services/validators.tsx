import { User } from "@prisma/client";
import { ObjectId } from "mongodb";
import { PaginationParamsInterface } from "~/shared/pagination-params-interface";
import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";
import { prisma } from "~/data/database/database.server";

export function validateNumber(value: any) {
  return !isNaN(Number(value)) && typeof Number(value) === "number";
}

export function validateIdFormat(id: any | undefined) {
  return id === undefined || ObjectId.isValid(id);
}

export function validateMultipleIdsFormat(ids: any[] | undefined) {
  return ids?.every((id) => validateIdFormat(id));
}

export function validatePaginationParams(
  params: PaginationParamsInterface
): ServerResponseErrorInterface | null {
  if (!validateNumber(params.page)) {
    return {
      errorCode: 400,
      errors: {
        page: "Page must be a valid number",
      },
    };
  }

  if (params.pageSize !== "all" && !validateNumber(params.pageSize)) {
    return {
      errorCode: 400,
      errors: {
        pageSize: "Page size must be a valid number or 'all'",
      },
    };
  }

  return null;
}

export async function validateCompany(
  companyId: string | undefined,
  user: User
): Promise<ServerResponseErrorInterface | null> {
  if (companyId) {
    if (!validateIdFormat(companyId)) {
      return {
        errorCode: 400,
        errors: {
          company: "Invalid company ID format",
        },
      };
    }

    const validCompany = await prisma.company.findFirst({
      where: {
        id: companyId,
        user_id: user.id,
      },
    });

    if (validCompany === null) {
      return {
        errorCode: 400,
        errors: {
          name: "Invalid company",
        },
      };
    }
  }

  return null;
}

export async function validateCompanies(
  companyIds: string[] | undefined,
  user: User
): Promise<ServerResponseErrorInterface | null> {
  if (companyIds && companyIds.length > 0) {
    for (const companyId of companyIds) {
      const error = await validateCompany(companyId, user);
      if (error) {
        return error;
      }
    }
  }

  return null;
}
