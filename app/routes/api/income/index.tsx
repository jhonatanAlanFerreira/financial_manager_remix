import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/data/auth/auth.server";
import { IncomeLoaderParamsInterface } from "~/data/income/income-query-params-interfaces";
import {
  IncomeCreateRequestInterface,
  IncomeUpdateRequestInterface,
} from "~/data/income/income-request-interfaces";
import { create, list, remove, update } from "~/data/income/income.server";

export let action = async ({ request }: ActionFunctionArgs) => {
  switch (request.method) {
    case "POST":
      return createIncome(request);
    case "DELETE":
      return removeIncome(request);
    case "PATCH":
      return updateIncome(request);
  }
};

export let loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUserSession(request);

  const url = new URL(request.url);
  const params: IncomeLoaderParamsInterface = {
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

let createIncome = async (request: Request) => {
  const user = await requireUserSession(request);
  const body = await request.formData();

  const data: IncomeCreateRequestInterface = {
    name: String(body.get("name") || ""),
    amount: +(body.get("amount") || 0),
    is_personal_income: !!body.get("is_personal_income"),
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

let removeIncome = async (request: Request) => {
  const user = await requireUserSession(request);
  const incomeId = String(new URL(request.url).searchParams.get("incomeId"));

  const res = await remove(incomeId, user);

  let status: number;

  if (res.error) {
    status = 404;
  } else {
    status = 200;
  }

  return new Response(JSON.stringify(res), { status });
};

let updateIncome = async (request: Request) => {
  const user = await requireUserSession(request);
  const incomeId = String(new URL(request.url).searchParams.get("incomeId"));
  const body = await request.formData();

  const data: IncomeUpdateRequestInterface = {
    name: String(body.get("name") || ""),
    amount: +(body.get("amount") || 0),
    is_personal_income: !!body.get("is_personal_income"),
    companies: body.get("companies")
      ? (body.getAll("companies") as string[])
      : [],
  };

  const res = await update(incomeId, user, data);

  let status: number;

  if (res.error) {
    status = 400;
  } else {
    status = 200;
  }

  return new Response(JSON.stringify(res), { status });
};
