import { User } from "@prisma/client";
import ValidatedData from "~/interfaces/ValidatedData";
import AccountCreateRequest from "~/interfaces/bodyRequests/account/AccountCreateRequest";
import { prisma } from "~/data/database.server";

export default async function accountCreateValidator(
  data: AccountCreateRequest,
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

  const accountExists = await prisma.account.findFirst({
    where: {
      name: data.name,
      user_id: user.id,
      company_id: data.company || null,
      is_personal_account: !data.company,
    },
  });

  if (accountExists !== null) {
    return {
      isValid: false,
      errors: {
        name: "This account already exists",
      },
    };
  }

  const validCompany = prisma.company.findFirst({
    where: {
      id: data.company,
      user_id: user.id,
    },
  });

  if (validCompany === null) {
    return {
      isValid: false,
      errors: {
        name: "Invalid company",
      },
    };
  }

  return {
    isValid: true,
  };
}
