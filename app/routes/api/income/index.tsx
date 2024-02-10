import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/data/auth.server";
import { create, list } from "~/data/income.server";
import IncomeCreateRequest from "~/interfaces/bodyRequests/IncomeCreateRequest";

export let action = async ({ request }: ActionFunctionArgs) => {
  switch (request.method) {
    case "POST":
      return createIncome(request);
    //   case "DELETE":
    //     return removeExpense(request);
    //   case "PATCH":
    //     return updateExpense(request);
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
