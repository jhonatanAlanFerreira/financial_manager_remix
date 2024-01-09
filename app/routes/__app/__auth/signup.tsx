import { Form } from "@remix-run/react";
import axios, { AxiosResponse, isAxiosError } from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { getError } from "utilities";
import InputText from "~/components/inputText/InputText";
import ServerResponse from "~/interfaces/ServerResponse";

export default function Signup() {
  const [responseErrors, setResponseErrors] = useState<ServerResponse>({});

  const formSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    toast.promise(axios.post("/api/auth", formData), {
      loading: "Creating new user",
      success: (res: AxiosResponse<ServerResponse>) => {
        setResponseErrors({});
        return res.data.message as string;
      },
      error: (error) => {
        if (isAxiosError(error)) {
          setResponseErrors(error.response?.data);
          return (
            error.response?.data.message ||
            "Sorry, unexpected error. Be back soon"
          );
        }
        return "Sorry, unexpected error. Be back soon";
      },
    });
  };

  return (
    <div className="h-screen bg-violet-950 flex justify-center items-center">
      <div className="bg-white rounded-lg h-5/6 w-full mx-4 md:w-3/5 p-5 flex flex-col justify-between">
        <h1 className="text-center text-2xl font-bold text-violet-950">
          Sign Up
        </h1>

        <Form method="post" id="signup-form" onSubmit={formSubmit}>
          <InputText label="Name" name="name" required></InputText>
          <InputText
            label="Login"
            name="login"
            required
            errorMessage={getError(responseErrors?.data, "login")}
          ></InputText>
          <InputText
            label="Password"
            name="password"
            type="password"
            required
            errorMessage={getError(responseErrors?.data, "password")}
          ></InputText>
          <InputText
            label="Repeat Password"
            name="passwordRepeat"
            type="password"
            required
            errorMessage={getError(responseErrors?.data, "password")}
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
