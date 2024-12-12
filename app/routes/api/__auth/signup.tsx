import { ActionFunctionArgs, json } from "@remix-run/node";
import { SignupRequestInterface } from "~/data/auth/auth-request-interfaces";
import { createUserSession, signup } from "~/data/auth/auth.server";
import { sendResponse } from "~/data/services/responses";

export let action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    throw json({ message: "Invalid request method" }, { status: 400 });
  }

  const body = await request.formData();

  const data: SignupRequestInterface = {
    name: String(body.get("name")),
    login: String(body.get("login")),
    password: String(body.get("password")),
    passwordRepeat: String(body.get("passwordRepeat")),
  };

  const res = await signup(data);

  return sendResponse(res, [
    ["Set-Cookie", await createUserSession(res.data?.id)],
  ]);
};
