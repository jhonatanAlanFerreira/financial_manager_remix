import { User } from "@prisma/client";
import {
  MerchantCreateRequestInterface,
  MerchantUpdateRequestInterface,
} from "~/data/merchant/merchant-request-interface";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import { prisma } from "~/data/database/database.server";
import {
  merchantCreateValidator,
  merchantDeleteValidator,
  merchantUpdateValidator,
} from "~/data/merchant/merchant-validator";

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

export async function update(
  merchantId: string,
  user: User,
  data: MerchantUpdateRequestInterface
): Promise<ServerResponseInterface> {
  const serverError = await merchantUpdateValidator(data, user, merchantId);

  if (serverError) {
    return {
      serverError,
      message: "There are some errors in your form",
    };
  }

  const res = await prisma.merchant.update({
    data: {
      name: data.name,
      user_id: user.id,
    },
    where: {
      id: merchantId,
    },
  });

  return {
    data: res,
    message: "Merchant was updated successfully",
  };
}

export async function remove(
  merchantId: string,
  user: User
): Promise<ServerResponseInterface> {
  const serverError = await merchantDeleteValidator(user, merchantId);

  if (serverError) {
    return {
      serverError,
      message: "There are some invalid params",
    };
  }

  await prisma.merchant.delete({
    where: {
      id: merchantId,
    },
  });

  return {
    message: "Merchant removed successfully",
  };
}
