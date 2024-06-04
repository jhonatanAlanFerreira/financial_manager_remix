import { User } from "@prisma/client";
import ValidatedData from "~/interfaces/ValidatedData";
import CompanyCreateRequest from "~/interfaces/bodyRequests/company/CompanyCreateRequest";
import { prisma } from "~/data/database.server";

export default async function companyCreateValidator(
  data: CompanyCreateRequest,
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
