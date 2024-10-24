import { User } from "@prisma/client";
import { ObjectId } from "mongodb";
import { PaginationParamsInterface } from "~/shared/pagination-params-interface";
import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";
import { prisma } from "~/data/database/database.server";

export function validatePaginationParams(
  params: PaginationParamsInterface
): ServerResponseErrorInterface | null {
  if (isNaN(params.page) || typeof params.page !== "number") {
    return {
      errorCode: 400,
      errors: {
        page: "Page must be a valid number",
      },
    };
  }

  if (
    params.pageSize !== "all" &&
    (isNaN(Number(params.pageSize)) || typeof params.pageSize !== "number")
  ) {
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
    if (!ObjectId.isValid(companyId)) {
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
