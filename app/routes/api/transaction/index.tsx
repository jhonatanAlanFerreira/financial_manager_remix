import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/data/auth.server";
import { create, list, remove, update } from "~/data/transaction.server";
import TransactionCreateRequest from "~/interfaces/bodyRequests/TransactionCreateRequest";
import TransactionUpdateRequest from "~/interfaces/bodyRequests/TransactionUpdateRequest";

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

  const data: TransactionCreateRequest = {
    name: String(body.get("name") || ""),
    amount: +(body.get("amount") || 0),
    company_id: body.get("company") ? String(body.get("company")) : null,
    expense_id: body.get("expense") ? String(body.get("expense")) : null,
    income_id: body.get("income_id") ? String(body.get("income_id")) : null,
    transaction_classification_ids: body.get("classification_ids")
      ? (body.getAll("classification_ids") as string[])
      : [],
    user_id: user.id,
    transaction_date: String(body.get("transaction_date") || ""),
    is_personal_transaction: !!body.get("is_personal_transaction"),
    is_income: !!body.get("is_income"),
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

let removeTransaction = async (request: Request) => {
  const user = await requireUserSession(request);
  const transactionId = String(
    new URL(request.url).searchParams.get("transactionId")
  );

  const res = await remove(transactionId, user);

  let status: number;

  if (res.error) {
    status = 404;
  } else {
    status = 200;
  }

  return new Response(JSON.stringify(res), { status });
};

let updateTransaction = async (request: Request) => {
  const user = await requireUserSession(request);
  const transactionId = String(
    new URL(request.url).searchParams.get("transactionId")
  );
  const body = await request.formData();

  const data: TransactionUpdateRequest = {
    name: String(body.get("name") || ""),
    amount: +(body.get("amount") || 0),
    company_id: body.get("company") ? String(body.get("company")) : null,
    expense_id: body.get("expense") ? String(body.get("expense")) : null,
    income_id: body.get("income_id") ? String(body.get("income_id")) : null,
    transaction_classification_ids: body.get("classification_ids")
      ? (body.getAll("classification_ids") as string[])
      : [],
    user_id: user.id,
    transaction_date: String(body.get("transaction_date") || ""),
    is_personal_transaction: !!body.get("is_personal_transaction"),
    is_income: !!body.get("is_income"),
  };

  const res = await update(transactionId, user, data);

  let status: number;

  if (res.error) {
    status = 400;
  } else {
    status = 200;
  }

  return new Response(JSON.stringify(res), { status });
};

export let loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUserSession(request);

  return list(user);
};
