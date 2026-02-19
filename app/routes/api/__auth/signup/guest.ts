import { ActionFunctionArgs, json } from "@remix-run/node";
import { SignupRequestInterface } from "~/data/auth/auth-request-interfaces";
import { createUserSession, signupAsGuest } from "~/data/auth/auth.server";
import { sendResponse } from "~/data/services/responses";

export let action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    throw json({ message: "Invalid request method" }, { status: 400 });
  }

  const guestLogin = "guest_" + Math.random().toString(36).substring(2, 8);
  const guestPass = "pass_" + Math.random().toString(36).substring(2, 8);

  const data: SignupRequestInterface = {
    name: String(guestLogin),
    login: String(guestLogin),
    password: String(guestPass),
    passwordRepeat: String(guestPass),
  };

  const res = await signupAsGuest(data);

  return sendResponse(res, [
    ["Set-Cookie", await createUserSession(res.data?.id)],
  ]);
};
