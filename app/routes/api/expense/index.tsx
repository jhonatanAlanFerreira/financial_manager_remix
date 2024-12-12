import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { requireUserSession } from "~/data/auth/auth.server";
import { ExpenseLoaderParamsInterface } from "~/data/expense/expense-query-params-interfaces";
import {
  ExpenseCreateRequestInterface,
  ExpenseUpdateRequestInterface,
} from "~/data/expense/expense-request-interfaces";
import { expenseIncludeOptions } from "~/data/expense/expense-types";
import { create, list, remove, update } from "~/data/expense/expense.server";
import { sendResponse } from "~/data/services/responses";
import { IsPersonalOrCompanyType } from "~/shared/shared-types";
import { getArrayFromFormData, parseIncludes } from "~/utils/utilities";

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

export let loader = async (
  { request }: LoaderFunctionArgs,
  overrideParams?: Partial<ExpenseLoaderParamsInterface>
) => {
  const user = await requireUserSession(request);

  const url = new URL(request.url);
  const params: ExpenseLoaderParamsInterface = {
    page: Number(url.searchParams.get("page")) || 1,
    pageSize: Number(url.searchParams.get("pageSize")) || "all",
    amount_greater: Number(url.searchParams.get("amount_greater")),
    amount_less: Number(url.searchParams.get("amount_less")),
    has_company: url.searchParams.get("company") || undefined,
    name: url.searchParams.get("name") || undefined,
    is_personal_or_company:
      (url.searchParams.get(
        "is_personal_or_company"
      ) as IsPersonalOrCompanyType) || "all",
    extends: parseIncludes(url, expenseIncludeOptions),
  };

  const finalParams = {
    ...params,
    ...overrideParams,
  };

  return sendResponse(await list(user, finalParams));
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

  return sendResponse(await remove(expenseId, user));
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
