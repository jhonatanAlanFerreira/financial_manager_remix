import { requireUserSession } from "~/data/auth.server";
import AccountCreateRequest from "~/interfaces/bodyRequests/account/AccountCreateRequest";
import { create, list, remove, update } from "~/data/account.server";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import AccountUpdateRequest from "~/interfaces/bodyRequests/account/AccountUpdateRequest";

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

  const data: AccountCreateRequest = {
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

export let loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUserSession(request);
  return list(user);
};

let updateAccount = async (request: Request) => {
  const user = await requireUserSession(request);
  const accountId = String(new URL(request.url).searchParams.get("accountId"));
  const body = await request.formData();

  const data: AccountUpdateRequest = {
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
