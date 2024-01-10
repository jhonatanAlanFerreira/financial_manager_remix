import { ActionFunctionArgs } from "@remix-run/node";
import { signup } from "~/data/auth.server";
import SignupRequest from "~/interfaces/bodyRequests/SignupRequest";

export let action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.formData();

  const data: SignupRequest = {
    name: String(body.get("name")),
    login: String(body.get("login")),
    password: String(body.get("password")),
    passwordRepeat: String(body.get("passwordRepeat")),
  };

  const res = await signup(data);

  const status = res.error ? 400 : 201;

  return new Response(JSON.stringify(res), { status });
};
