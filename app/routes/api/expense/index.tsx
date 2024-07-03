import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { requireUserSession } from "~/data/auth.server";
import { create, list, remove, update } from "~/data/expense.server";
import ExpenseCreateRequest from "~/interfaces/bodyRequests/expense/ExpenseCreateRequest";
import ExpenseUpdateRequest from "~/interfaces/bodyRequests/expense/ExpenseUpdateRequest";
import ExpenseLoaderParams from "~/interfaces/queryParams/expense/ExpenseLoaderParams";

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
  const params: ExpenseLoaderParams = {
    page: Number(url.searchParams.get("page")) || 1,
    pageSize: Number(url.searchParams.get("pageSize")) || 10,
    amount_greater: Number(url.searchParams.get("amount_greater")),
    amount_less: Number(url.searchParams.get("amount_less")),
    company: url.searchParams.get("company"),
    name: url.searchParams.get("name"),
    is_personal_or_company: url.searchParams.get("is_personal_or_company") as
      | "all"
      | "personal"
      | "company",
  };
  return list(user, params);
};

let createExpense = async (request: Request) => {
  const user = await requireUserSession(request);
  const body = await request.formData();

  const data: ExpenseCreateRequest = {
    name: String(body.get("name") || ""),
    amount: +(body.get("amount") || 0),
    is_personal_expense: !!body.get("is_personal_expense"),
    companies: body.get("companies")
      ? (body.getAll("companies") as string[])
      : [],
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

let removeExpense = async (request: Request) => {
  const user = await requireUserSession(request);
  const expenseId = String(new URL(request.url).searchParams.get("expenseId"));

  const res = await remove(expenseId, user);

  let status: number;

  if (res.error) {
    status = 404;
  } else {
    status = 200;
  }

  return new Response(JSON.stringify(res), { status });
};

let updateExpense = async (request: Request) => {
  const user = await requireUserSession(request);
  const expenseId = String(new URL(request.url).searchParams.get("expenseId"));
  const body = await request.formData();

  const data: ExpenseUpdateRequest = {
    name: String(body.get("name") || ""),
    amount: +(body.get("amount") || 0),
    is_personal_expense: !!body.get("is_personal_expense"),
    companies: body.get("companies")
      ? (body.getAll("companies") as string[])
      : [],
  };

  const res = await update(expenseId, user, data);

  let status: number;

  if (res.error) {
    status = 400;
  } else {
    status = 200;
  }

  return new Response(JSON.stringify(res), { status });
};
