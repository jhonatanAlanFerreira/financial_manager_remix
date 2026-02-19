import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/data/auth/auth.server";
import { sendResponse } from "~/data/services/responses";
import { TransactionLoaderParamsInterface } from "~/data/transaction/transaction-query-params-interfaces";
import {
  TransactionCreateRequestInterface,
  TransactionUpdateRequestInterface,
} from "~/data/transaction/transaction-request-interfaces";
import { transactionIncludeOptions } from "~/data/transaction/transaction-types";
import {
  create,
  list,
  remove,
  update,
} from "~/data/transaction/transaction.server";
import {
  IsIncomeOrExpenseType,
  IsPersonalOrCompanyType,
} from "~/shared/shared-types";
import {
  getArrayFromFormData,
  getOptionalField,
  parseIncludes,
} from "~/utils/utilities";

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
    merchant: getOptionalField(body, "merchant"),
    account: String(body.get("account") || ""),
    classifications: getArrayFromFormData(body, "transaction_classifications"),
    date: String(body.get("date") || ""),
    is_personal: body.get("is_personal") == "true",
    is_income: body.get("is_income") == "true",
    description: String(body.get("description") || ""),
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
    company: getOptionalField(body, "company") || null,
    expense: getOptionalField(body, "expense") || null,
    income: getOptionalField(body, "income") || null,
    merchant: getOptionalField(body, "merchant") || null,
    account: String(body.get("account") || ""),
    classifications: getArrayFromFormData(body, "transaction_classifications"),
    date: String(body.get("date") || ""),
    is_personal: body.get("is_personal") == "true",
    is_income: body.get("is_income") == "true",
    description: String(body.get("description") || ""),
  };

  return sendResponse(await update(transactionId, user, data));
};

export let loader = async (
  { request }: LoaderFunctionArgs,
  overrideParams?: Partial<TransactionLoaderParamsInterface>
) => {
  const user = await requireUserSession(request);

  const url = new URL(request.url);
  const params: TransactionLoaderParamsInterface = {
    page: Number(url.searchParams.get("page")) || 1,
    pageSize: Number(url.searchParams.get("pageSize")) || "all",
    amount_greater: Number(url.searchParams.get("amount_greater")),
    amount_less: Number(url.searchParams.get("amount_less")),
    date_after: url.searchParams.get("date_after") || undefined,
    date_before: url.searchParams.get("date_before") || undefined,
    expense: url.searchParams.get("expense") || undefined,
    merchant: url.searchParams.get("merchant") || undefined,
    income: url.searchParams.get("income") || undefined,
    account: url.searchParams.get("account") || undefined,
    has_classification: url.searchParams.get("has_classification") || undefined,
    company: url.searchParams.get("company") || undefined,
    name: url.searchParams.get("name") || undefined,
    is_income_or_expense:
      (url.searchParams.get("is_income_or_expense") as IsIncomeOrExpenseType) ||
      "all",
    is_personal_or_company:
      (url.searchParams.get(
        "is_personal_or_company"
      ) as IsPersonalOrCompanyType) || "all",
    sort_key: url.searchParams.get("sort_key") || "date",
    sort_order:
      (url.searchParams.get("sort_order") as "desc" | "asc") || "desc",
    extends: parseIncludes(url, transactionIncludeOptions),
  };

  const finalParams = {
    ...params,
    ...overrideParams,
  };

  return sendResponse(await list(user, finalParams));
};
