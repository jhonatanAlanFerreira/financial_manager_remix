import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/data/auth/auth.server";
import { sendResponse } from "~/data/services/responses";
import { TransactionLoaderParamsInterface } from "~/data/transaction/transaction-query-params-interfaces";
import {
  TransactionCreateRequestInterface,
  TransactionUpdateRequestInterface,
} from "~/data/transaction/transaction-request-interfaces";
import {
  create,
  list,
  remove,
  update,
} from "~/data/transaction/transaction.server";
import { getArrayFromFormData, getOptionalField } from "~/utils/utilities";

export let action = async ({ request }: ActionFunctionArgs) => {
  switch (request.method) {
    case "POST":
      return createTransaction(request);
    case "DELETE":
      return removeTransaction(request);
    case "PATCH":
      return updateTransaction(request);
  }
};

let createTransaction = async (request: Request) => {
  const user = await requireUserSession(request);
  const body = await request.formData();

  const data: TransactionCreateRequestInterface = {
    name: String(body.get("name") || ""),
    amount: +(body.get("amount") || 0),
    company: getOptionalField(body, "company"),
    expense: getOptionalField(body, "expense"),
    income: getOptionalField(body, "income"),
    account: String(body.get("account") || ""),
    classifications: getArrayFromFormData(body, "classifications"),
    transaction_date: String(body.get("transaction_date") || ""),
    is_personal: body.get("is_personal") == "true",
    is_income: body.get("is_income") == "true",
  };

  return sendResponse(await create(data, user));
};

let removeTransaction = async (request: Request) => {
  const user = await requireUserSession(request);
  const transactionId = String(
    new URL(request.url).searchParams.get("transactionId")
  );

  return sendResponse(await remove(transactionId, user));
};

let updateTransaction = async (request: Request) => {
  const user = await requireUserSession(request);
  const transactionId = String(
    new URL(request.url).searchParams.get("transactionId")
  );
  const body = await request.formData();

  const data: TransactionUpdateRequestInterface = {
    name: String(body.get("name") || ""),
    amount: +(body.get("amount") || 0),
    company: getOptionalField(body, "company"),
    expense: getOptionalField(body, "expense"),
    income: getOptionalField(body, "income"),
    account: String(body.get("account") || ""),
    classifications: getArrayFromFormData(body, "classifications"),
    transaction_date: String(body.get("transaction_date") || ""),
    is_personal: body.get("is_personal") == "true",
    is_income: body.get("is_income") == "true",
  };

  return sendResponse(await update(transactionId, user, data));
};

export let loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUserSession(request);

  const url = new URL(request.url);
  const params: TransactionLoaderParamsInterface = {
    page: Number(url.searchParams.get("page")) || 1,
    pageSize: Number(url.searchParams.get("pageSize")) || "all",
    amount_greater: Number(url.searchParams.get("amount_greater")),
    amount_less: Number(url.searchParams.get("amount_less")),
    date_after: url.searchParams.get("date_after"),
    date_before: url.searchParams.get("date_before"),
    expense: url.searchParams.get("expense"),
    income: url.searchParams.get("income"),
    company: url.searchParams.get("company"),
    name: url.searchParams.get("name"),
    is_income_or_expense:
      (url.searchParams.get("is_income_or_expense") as
        | "expense"
        | "income"
        | "all") || "all",
    is_personal_or_company:
      (url.searchParams.get("is_personal_or_company") as
        | "all"
        | "personal"
        | "company") || "all",
  };

  return list(user, params);
};
