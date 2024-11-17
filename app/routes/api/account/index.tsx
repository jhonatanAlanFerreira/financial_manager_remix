import { requireUserSession } from "~/data/auth/auth.server";
import { create, list, remove, update } from "~/data/account/account.server";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  AccountCreateRequestInterface,
  AccountUpdateRequestInterface,
} from "~/data/account/account-request-interfaces";
import { AccountLoaderParamsInterface } from "~/data/account/account-query-params-interfaces";
import { IsPersonalOrCompanyType } from "~/shared/shared-types";
import { sendResponse } from "~/data/services/responses";

export let action = async ({ request }: ActionFunctionArgs) => {
  switch (request.method) {
    case "POST":
      return createAccount(request);
    case "DELETE":
      return removeAccount(request);
    case "PATCH":
      return updateAccount(request);
  }
};

export let loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUserSession(request);

  const url = new URL(request.url);
  const params: AccountLoaderParamsInterface = {
    company: url.searchParams.get("company") || undefined,
    name: url.searchParams.get("name") || undefined,
    is_personal_or_company:
      (url.searchParams.get(
        "is_personal_or_company"
      ) as IsPersonalOrCompanyType) || "all",
    page: Number(url.searchParams.get("page")) || 1,
    pageSize: Number(url.searchParams.get("pageSize")) || "all",
  };

  return sendResponse(await list(user, params));
};

let createAccount = async (request: Request) => {
  const user = await requireUserSession(request);
  const body = await request.formData();

  const data: AccountCreateRequestInterface = {
    name: String(body.get("name") || ""),
    balance: +(body.get("balance") || 0),
    company: String(body.get("company") || ""),
  };

  return sendResponse(await create(data, user));
};

let removeAccount = async (request: Request) => {
  const user = await requireUserSession(request);
  const accountId = String(new URL(request.url).searchParams.get("accountId"));

  return sendResponse(await remove(accountId, user));
};

let updateAccount = async (request: Request) => {
  const user = await requireUserSession(request);
  const accountId = String(new URL(request.url).searchParams.get("accountId"));
  const body = await request.formData();

  const data: AccountUpdateRequestInterface = {
    name: String(body.get("name") || ""),
    balance: +(body.get("balance") || 0),
  };

  return sendResponse(await update(accountId, user, data));
};
