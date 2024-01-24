import { User } from "@prisma/client";
import ValidatedData from "~/interfaces/ValidatedData";
import CompanyUpdateRequest from "~/interfaces/bodyRequests/UpdateCompanyRequest";
import { prisma } from "~/data/database.server";

export default async function companyUpdateValidator(
  data: CompanyUpdateRequest,
  user: User,
  companyId: string
): Promise<ValidatedData> {
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

  return {
    isValid: true,
  };
}
