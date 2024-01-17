import { ActionFunctionArgs, json } from "@remix-run/node";
import { create } from "~/data/expense.server";
import ExpenseCreateRequest from "~/interfaces/bodyRequests/ExpenseCreateRequest";

export let action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    throw json({ message: "Invalid request method" }, { status: 400 });
  }

  const body = await request.formData();

  const data: ExpenseCreateRequest = {
    name: String(body.get("name")),
    amount: +(body.get("amount") || 0),
    is_personal_expense: !!body.get("is_personal_expense"),
  };

  const res = await create(data);
};
