import { User } from "@prisma/client";
import ValidatedData from "~/interfaces/ValidatedData";
import { prisma } from "~/data/database.server";

export default async function companyDeleteValidator(
  user: User,
  companyId: string
): Promise<ValidatedData> {
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
