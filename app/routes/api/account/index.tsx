import { requireUserSession } from "~/data/auth/auth.server";
import { create, list, remove, update } from "~/data/account/account.server";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { AccountCreateRequestInterface, AccountUpdateRequestInterface } from "~/data/account/account-request-interfaces";

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

let createAccount = async (request: Request) => {
  const user = await requireUserSession(request);
  const body = await request.formData();

  const data: AccountCreateRequestInterface = {
    name: String(body.get("name") || ""),
    balance: +(body.get("balance") || 0),
    company: String(body.get("company") || ""),
  };

  const res = await create(data, user);

  let status: number;

  if (res.error) {
    status = 400;
  } else {
    status = 201;
  }

  return new Response(JSON.stringify(res), { status });
};

let removeAccount = async (request: Request) => {
  const user = await requireUserSession(request);
  const accountId = String(new URL(request.url).searchParams.get("accountId"));

  const res = await remove(accountId, user);

  let status: number;

  if (res.error) {
    status = 404;
  } else {
    status = 200;
  }

  return new Response(JSON.stringify(res), { status });
};

export let loader = async (
  { request }: LoaderFunctionArgs,
  personalOnly = true
) => {
  const user = await requireUserSession(request);
  return list(user, personalOnly);
};

let updateAccount = async (request: Request) => {
  const user = await requireUserSession(request);
  const accountId = String(new URL(request.url).searchParams.get("accountId"));
  const body = await request.formData();

  const data: AccountUpdateRequestInterface = {
    name: String(body.get("name") || ""),
    balance: +(body.get("balance") || 0),
  };

  const res = await update(accountId, user, data);

  let status: number;

  if (res.error) {
    status = 400;
  } else {
    status = 200;
  }

  return new Response(JSON.stringify(res), { status });
};
