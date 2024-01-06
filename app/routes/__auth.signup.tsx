import { ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { parseJsonOrNull } from "utilities";
import InputText from "~/components/inputText/InputText";
import { signup } from "~/data/auth.server";
import { getError } from "~/data/requestValidators/authValidator";
import ServerResponse from "~/interfaces/ServerResponse";
import SignupRequest from "~/interfaces/bodyRequests/SignupRequest";

export default function Signup() {
  const actionData: ServerResponse = parseJsonOrNull(useActionData() as string);

  return (
    <div className="h-screen bg-violet-950 flex justify-center items-center">
      <div className="bg-white rounded-lg h-5/6 w-full mx-4 md:w-3/5 p-5 flex flex-col justify-between">
        <h1 className="text-center text-2xl font-bold text-violet-950">
          Sign Up
        </h1>

        <Form method="post" id="signup-form">
          <InputText label="Name" name="name" required></InputText>
          <InputText label="Login" name="login" required></InputText>
          <InputText
            label="Password"
            name="password"
            type="password"
            required
            errorMessage={getError(actionData?.data, "password")}
          ></InputText>
          <InputText
            label="Repeat Password"
            name="passwordRepeat"
            type="password"
            required
            errorMessage={getError(actionData?.data, "password")}
          ></InputText>
        </Form>

        <div className="text-right">
          <button
            form="signup-form"
            type="submit"
            className="bg-violet-950 text-white rounded-lg px-10 py-1"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export async function action({ request }: ActionFunctionArgs) {
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
}
