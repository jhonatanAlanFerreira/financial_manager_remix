import { Merchant, Prisma, User } from "@prisma/client";
import {
  MerchantCreateRequestInterface,
  MerchantUpdateRequestInterface,
} from "~/data/merchant/merchant-request-interface";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import { prisma } from "~/data/database/database.server";
import {
  merchantCreateValidator,
  merchantDeleteValidator,
  merchantListValidator,
  merchantUpdateValidator,
} from "~/data/merchant/merchant-validator";
import { MerchantLoaderParamsInterface } from "~/data/merchant/merchant-query-params-interfaces";
import { paginate } from "~/data/services/list.service";

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

export async function list(
  user: User,
  params: MerchantLoaderParamsInterface
): Promise<ServerResponseInterface<Merchant[]>> {
  const serverError = await merchantListValidator(params);

  if (serverError) {
    return {
      serverError,
      message: "There are some invalid params",
    };
  }

  const { page, pageSize, extends: merchantIncludes, ...restParams } = params;

  return paginate<
    Merchant,
    Prisma.MerchantFindManyArgs,
    Prisma.MerchantCountArgs
  >(
    prisma.merchant.findMany,
    prisma.merchant.count,
    { page, pageSize },
    restParams,
    { user_id: user.id },
    merchantIncludes,
    { column: restParams.sort_key, order: restParams.sort_order }
  );
}
