import { ActionFunctionArgs } from "@remix-run/node";
import { createUserSession } from "utilities";
import { login } from "~/data/auth.server";
import LoginRequest from "~/interfaces/bodyRequests/LoginRequest";

export let action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.formData();

  const data: LoginRequest = {
    login: String(body.get("login")),
    password: String(body.get("password")),
  };

  const res = await login(data);

  let status: number;
  let headers: HeadersInit = [];

  if (res.error) {
    status = 401;
  } else {
    status = 200;
    headers = [["Set-Cookie", await createUserSession(res.data.id)]];
  }

  return new Response(JSON.stringify(res), { status, headers });
};
