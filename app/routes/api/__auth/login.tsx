import { ActionFunctionArgs, json } from "@remix-run/node";
import { LoginRequestInterface } from "~/data/auth/auth-request-interfaces";
import { createUserSession, login } from "~/data/auth/auth.server";

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

  let status: number;
  let headers: HeadersInit = [];

  if (res.errors) {
    status = res.errors.errorCode;
  } else {
    status = 200;
    headers = [["Set-Cookie", await createUserSession(res.data.id)]];
  }

  return new Response(JSON.stringify(res), { status, headers });
};
