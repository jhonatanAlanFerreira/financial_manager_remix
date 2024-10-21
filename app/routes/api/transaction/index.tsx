import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/data/auth/auth.server";
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
    company: body.get("company") ? String(body.get("company")) : null,
    expense: body.get("expense") ? String(body.get("expense")) : null,
    income: body.get("income") ? String(body.get("income")) : null,
    account: String(body.get("account")),
    classifications: body.get("classifications")
      ? (body.getAll("classifications") as string[])
      : [],
    transaction_date: String(body.get("transaction_date") || ""),
    is_personal_transaction: !!body.get("is_personal_transaction"),
    is_income: !!body.get("is_income"),
  };

  const res = await create(data, user);

  let status: number;

  //WIP
  status = 200;

  return new Response(JSON.stringify(res), { status });
};

let removeTransaction = async (request: Request) => {
  const user = await requireUserSession(request);
  const transactionId = String(
    new URL(request.url).searchParams.get("transactionId")
  );

  const res = await remove(transactionId, user);

  let status: number;

  //WIP
  status = 200;

  return new Response(JSON.stringify(res), { status });
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
    company: body.get("company") ? String(body.get("company")) : null,
    expense: body.get("expense") ? String(body.get("expense")) : null,
    income: body.get("income") ? String(body.get("income")) : null,
    account: String(body.get("account")),
    classifications: body.get("classifications")
      ? (body.getAll("classifications") as string[])
      : [],
    transaction_date: String(body.get("transaction_date") || ""),
    is_personal_transaction: !!body.get("is_personal_transaction"),
    is_income: !!body.get("is_income"),
  };

  const res = await update(transactionId, user, data);

  let status: number;

  //WIP
  status = 200;

  return new Response(JSON.stringify(res), { status });
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
