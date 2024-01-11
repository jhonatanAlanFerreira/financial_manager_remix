import { Form, useNavigate } from "@remix-run/react";
import axios, { AxiosResponse, isAxiosError } from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import InputPassword from "~/components/inputPassword/InputPassword";
import InputText from "~/components/inputText/InputText";
import ServerResponse from "~/interfaces/ServerResponse";

export default function Login() {
  const [responseErrors, setResponseErrors] = useState<ServerResponse>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  const formSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setIsSubmitting(true);

    toast
      .promise(axios.post("/api/login", formData), {
        loading: "Logging in",
        success: (res: AxiosResponse<ServerResponse>) => {
          navigate("/");
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
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="h-screen bg-violet-950 flex justify-center items-center">
      <div className="overflow-auto bg-white rounded-lg h-1/2 w-full mx-4 md:w-3/5 p-5 flex flex-col justify-between">
        <h1 className="text-center text-2xl font-bold text-violet-950">
          Login In
        </h1>

        <Form method="post" id="login-form" onSubmit={formSubmit}>
          <InputText
            label="Login"
            name="login"
            required
            errorMessage={responseErrors?.data?.errors?.["login"]}
          ></InputText>
          <InputPassword
            showEyeIcon={true}
            label="Password"
            name="password"
            required
            errorMessage={responseErrors?.data?.errors?.["password"]}
          ></InputPassword>
        </Form>

        <div className="text-right">
          <button
            form="login-form"
            type="submit"
            className={`text-white rounded-lg px-10 py-1 ${
              isSubmitting ? "bg-violet-950/50" : "bg-violet-950"
            }`}
            disabled={isSubmitting}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}
