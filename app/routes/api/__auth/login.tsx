import { ActionFunctionArgs } from "@remix-run/node";
import { login } from "~/data/auth.server";
import LoginRequest from "~/interfaces/bodyRequests/LoginRequest";

export let action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.formData();

  const data: LoginRequest = {
    login: String(body.get("login")),
    password: String(body.get("password")),
  };

  const res = await login(data);

  const status = res.error ? 401 : 200;

  return new Response(JSON.stringify(res), { status });
};
