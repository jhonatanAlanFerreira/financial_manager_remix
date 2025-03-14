import { User } from "@prisma/client";
import {
  MerchantCreateRequestInterface,
  MerchantUpdateRequestInterface,
} from "~/data/merchant/merchant-request-interface";
import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";
import { prisma } from "~/data/database/database.server";
import {
  validateIdFormat,
  validatePaginationParams,
} from "~/data/services/validators";
import { MerchantLoaderParamsInterface } from "~/data/merchant/merchant-query-params-interfaces";

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

export async function merchantUpdateValidator(
  data: MerchantUpdateRequestInterface,
  user: User,
  merchantId: string
): Promise<ServerResponseErrorInterface | null> {
  if (!data.name) {
    return {
      errorCode: 400,
      errors: {
        name: "Name can not be empty",
      },
    };
  }

  if (!validateIdFormat(merchantId)) {
    return {
      errorCode: 400,
      errors: {
        merchantId: "Invalid merchant ID format",
      },
    };
  }

  const merchant = await prisma.merchant.findFirst({
    where: {
      id: merchantId,
      user_id: user.id,
    },
  });

  if (!merchant) {
    return {
      errorCode: 404,
      errors: {
        merchantId: "Merchant not found",
      },
    };
  }

  const merchantExists = await prisma.merchant.findFirst({
    where: {
      AND: [
        { id: { not: merchantId } },
        { name: data.name },
        { user_id: user.id },
      ],
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

export async function merchantDeleteValidator(
  user: User,
  merchantId: string
): Promise<ServerResponseErrorInterface | null> {
  if (!validateIdFormat(merchantId)) {
    return {
      errorCode: 400,
      errors: {
        merchantId: "Invalid merchant ID format",
      },
    };
  }

  const merchantExists = await prisma.merchant.findFirst({
    where: {
      id: merchantId,
      user_id: user.id,
    },
  });

  if (!merchantExists) {
    return {
      errorCode: 404,
      errors: {
        merchantId: "Merchant not found",
      },
    };
  }

  return null;
}

export async function merchantListValidator(
  params: MerchantLoaderParamsInterface
): Promise<ServerResponseErrorInterface | null> {
  const paginationErrors = validatePaginationParams(params);
  if (paginationErrors) {
    return paginationErrors;
  }

  if (params.sort_key && !["name"].includes(params.sort_key)) {
    return {
      errorCode: 400,
      errors: {
        sort_key: `${params.sort_key} is not a valid key`,
      },
    };
  }

  return null;
}
