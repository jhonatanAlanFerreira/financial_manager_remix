import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { requireUserSession } from "~/data/auth/auth.server";
import { ExpenseLoaderParamsInterface } from "~/data/expense/expense-query-params-interfaces";
import {
  ExpenseCreateRequestInterface,
  ExpenseUpdateRequestInterface,
} from "~/data/expense/expense-request-interfaces";
import { create, list, remove, update } from "~/data/expense/expense.server";
import { sendResponse } from "~/data/services/responses";
import { getArrayFromFormData } from "~/utils/utilities";

export let action = async ({ request }: ActionFunctionArgs) => {
  switch (request.method) {
    case "POST":
      return createExpense(request);
    case "DELETE":
      return removeExpense(request);
    case "PATCH":
      return updateExpense(request);
  }
};

export let loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUserSession(request);

  const url = new URL(request.url);
  const params: ExpenseLoaderParamsInterface = {
    page: Number(url.searchParams.get("page")) || 1,
    pageSize: Number(url.searchParams.get("pageSize")) || "all",
    amount_greater: Number(url.searchParams.get("amount_greater")),
    amount_less: Number(url.searchParams.get("amount_less")),
    company: url.searchParams.get("company"),
    name: url.searchParams.get("name"),
    is_personal_or_company:
      (url.searchParams.get("is_personal_or_company") as
        | "all"
        | "personal"
        | "company") || "all",
  };
  return list(user, params);
};

let createExpense = async (request: Request) => {
  const user = await requireUserSession(request);
  const body = await request.formData();

  const data: ExpenseCreateRequestInterface = {
    name: String(body.get("name") || ""),
    amount: +(body.get("amount") || 0),
    is_personal: body.get("is_personal") == "true",
    companies: getArrayFromFormData(body, "companies"),
  };

  return sendResponse(await create(data, user));
};

let removeExpense = async (request: Request) => {
  const user = await requireUserSession(request);
  const expenseId = String(new URL(request.url).searchParams.get("expenseId"));

  const res = await remove(expenseId, user);

  let status: number;

  //WIP
  status = 200;

  return new Response(JSON.stringify(res), { status });
};

let updateExpense = async (request: Request) => {
  const user = await requireUserSession(request);
  const expenseId = String(new URL(request.url).searchParams.get("expenseId"));
  const body = await request.formData();

  const data: ExpenseUpdateRequestInterface = {
    name: String(body.get("name") || ""),
    amount: +(body.get("amount") || 0),
    is_personal: body.get("is_personal") == "true",
    companies: getArrayFromFormData(body, "companies"),
  };

  return sendResponse(await update(expenseId, user, data));
};
