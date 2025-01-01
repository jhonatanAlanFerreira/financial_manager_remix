import { User } from "@prisma/client";
import { MerchantCreateRequestInterface } from "~/data/merchant/merchant-request-interface";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import { prisma } from "~/data/database/database.server";
import { merchantCreateValidator } from "~/data/merchant/merchant-validator";

export async function create(
  data: MerchantCreateRequestInterface,
  user: User
): Promise<ServerResponseInterface> {
  const serverError = await merchantCreateValidator(data, user);

  if (serverError) {
    return {
      serverError,
      message: "There are some errors in your form",
    };
  }

  const merchant = await prisma.merchant.create({
    data: {
      name: data.name,
      user_id: user.id,
    },
  });

  return {
    data: merchant,
    message: "Merchant was created successfully",
  };
}
