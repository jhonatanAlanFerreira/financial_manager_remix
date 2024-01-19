import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { requireUserSession } from "~/data/auth.server";
import { create, list } from "~/data/expense.server";
import ExpenseCreateRequest from "~/interfaces/bodyRequests/ExpenseCreateRequest";

export let action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    throw json({ message: "Invalid request method" }, { status: 400 });
  }

  const user = await requireUserSession(request);
  const body = await request.formData();

  const data: ExpenseCreateRequest = {
    name: String(body.get("name")),
    amount: +(body.get("amount") || 0),
    is_personal_expense: !!body.get("is_personal_expense"),
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
