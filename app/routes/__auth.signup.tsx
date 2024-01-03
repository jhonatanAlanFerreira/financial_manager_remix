import { ActionFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { redirect } from "react-router";
import InputText from "~/components/inputText/InputText";
import { prisma } from "~/data/database.server";

export default function Signup() {
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
          ></InputText>
          <InputText
            label="Repeat Password"
            name="passwordRepeat"
            type="password"
            required
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

  const user = await prisma.user.create({
    data: {
      name: String(body.get('name')),
      login: String(body.get('login')),
      password: String(body.get('password')),
    },
  });
  return redirect("/");
}
