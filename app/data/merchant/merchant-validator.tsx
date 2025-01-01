import { User } from "@prisma/client";
import { MerchantCreateRequestInterface } from "~/data/merchant/merchant-request-interface";
import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";
import { prisma } from "~/data/database/database.server";

export async function merchantCreateValidator(
  data: MerchantCreateRequestInterface,
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

  const merchantExists = await prisma.merchant.findFirst({
    where: {
      name: data.name,
      user_id: user.id,
    },
  });

  if (merchantExists !== null) {
    return {
      errorCode: 400,
      errors: {
        name: "This merchant already exists",
      },
    };
  }

  return null;
}
