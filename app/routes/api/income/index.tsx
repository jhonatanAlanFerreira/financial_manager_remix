import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/data/auth.server";
import { create, list, remove, update } from "~/data/income.server";
import IncomeCreateRequest from "~/interfaces/bodyRequests/IncomeCreateRequest";
import IncomeUpdateRequest from "~/interfaces/bodyRequests/IncomeUpdateRequest";

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

export let loader = async (
  { request }: LoaderFunctionArgs,
  includeCompanies = false
) => {
  const user = await requireUserSession(request);
  if (request.url.includes("includeCompanies=true")) {
    includeCompanies = true;
  }

  return list(user, includeCompanies);
};

let createIncome = async (request: Request) => {
  const user = await requireUserSession(request);
  const body = await request.formData();

  const data: IncomeCreateRequest = {
    name: String(body.get("name") || ""),
    amount: +(body.get("amount") || 0),
    is_personal_income: !!body.get("is_personal_income"),
    company_ids: body.get("companies")
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

  const data: IncomeCreateRequest = {
    name: String(body.get("name") || ""),
    amount: +(body.get("amount") || 0),
    is_personal_income: !!body.get("is_personal_income"),
    company_ids: body.get("companies")
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
