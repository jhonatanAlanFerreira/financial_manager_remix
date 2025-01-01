import { ActionFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/data/auth/auth.server";
import {
  MerchantCreateRequestInterface,
  MerchantUpdateRequestInterface,
} from "~/data/merchant/merchant-request-interface";
import { create, update } from "~/data/merchant/merchant.server";
import { sendResponse } from "~/data/services/responses";

export let action = async ({ request }: ActionFunctionArgs) => {
  switch (request.method) {
    case "POST":
      return createMerchant(request);
    case "DELETE":
      return;
    case "PATCH":
      return updateMerchant(request);
  }
};

let createMerchant = async (request: Request) => {
  const user = await requireUserSession(request);
  const body = await request.formData();

  const data: MerchantCreateRequestInterface = {
    name: String(body.get("name") || ""),
  };

  return sendResponse(await create(data, user));
};

let updateMerchant = async (request: Request) => {
  const user = await requireUserSession(request);
  const merchantId = String(
    new URL(request.url).searchParams.get("merchantId")
  );
  const body = await request.formData();

  const data: MerchantUpdateRequestInterface = {
    name: String(body.get("name") || ""),
  };

  return sendResponse(await update(merchantId, user, data));
};
