import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/data/auth/auth.server";
import { MerchantLoaderParamsInterface } from "~/data/merchant/merchant-query-params-interfaces";
import {
  MerchantCreateRequestInterface,
  MerchantUpdateRequestInterface,
} from "~/data/merchant/merchant-request-interface";
import { create, list, remove, update } from "~/data/merchant/merchant.server";
import { sendResponse } from "~/data/services/responses";
import { parseIncludes } from "~/utils/utilities";
import { merchantIncludeOptions } from "~/data/merchant/merchant-types";

export let action = async ({ request }: ActionFunctionArgs) => {
  switch (request.method) {
    case "POST":
      return createMerchant(request);
    case "DELETE":
      return removeMerchant(request);
    case "PATCH":
      return updateMerchant(request);
  }
};

export let loader = async (
  { request }: LoaderFunctionArgs,
  overrideParams?: Partial<MerchantLoaderParamsInterface>
) => {
  const user = await requireUserSession(request);

  const url = new URL(request.url);
  const params: MerchantLoaderParamsInterface = {
    page: Number(url.searchParams.get("page")) || 1,
    pageSize: Number(url.searchParams.get("pageSize")) || "all",
    name: url.searchParams.get("name") || undefined,
    sort_key: url.searchParams.get("sort_key") || undefined,
    sort_order:
      (url.searchParams.get("sort_order") as "desc" | "asc") || "desc",
    extends: parseIncludes(url, merchantIncludeOptions),
  };

  const finalParams = {
    ...params,
    ...overrideParams,
  };

  return sendResponse(await list(user, finalParams));
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

let removeMerchant = async (request: Request) => {
  const user = await requireUserSession(request);
  const merchantId = String(
    new URL(request.url).searchParams.get("merchantId")
  );

  return sendResponse(await remove(merchantId, user));
};
