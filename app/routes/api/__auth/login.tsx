import { ActionFunctionArgs, json } from "@remix-run/node";
import { LoginRequestInterface } from "~/data/auth/auth-request-interfaces";
import { createUserSession, login } from "~/data/auth/auth.server";
import { sendResponse } from "~/data/services/responses";

export let action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    throw json({ message: "Invalid request method" }, { status: 400 });
  }

  const body = await request.formData();

  const data: LoginRequestInterface = {
    login: String(body.get("login")),
    password: String(body.get("password")),
  };

  const res = await login(data);

  return sendResponse(res, [
    ["Set-Cookie", await createUserSession(res.data.id)],
  ]);
};
