import { ActionFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/data/auth/auth.server";
import { MerchantCreateRequestInterface } from "~/data/merchant/merchant-request-interface";
import { create } from "~/data/merchant/merchant.server";
import { sendResponse } from "~/data/services/responses";

export let action = async ({ request }: ActionFunctionArgs) => {
  switch (request.method) {
    case "POST":
      return createMerchant(request);
    case "DELETE":
      return;
    case "PATCH":
      return;
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
