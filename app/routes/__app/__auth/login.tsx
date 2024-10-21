import { Form, Link, useNavigate } from "@remix-run/react";
import axios, { AxiosResponse, isAxiosError } from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { PrimaryButton } from "~/components/buttons/primary-button/primary-button";
import { Icon } from "~/components/icon/icon";
import { InputPassword } from "~/components/inputs/input-password/input-password";
import { InputText } from "~/components/inputs/input-text/input-text";
import { NavigationLoader } from "~/components/navigation-loader/navigation-loader";
import { ServerResponseInterface } from "~/shared/server-response-interface";

export default function Login() {
  const [responseErrors, setResponseErrors] = useState<
    ServerResponseInterface<any> //WIP
  >({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  const formSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setIsSubmitting(true);

    toast
      .promise(axios.post("/api/login", formData), {
        loading: "Logging in",
        success: (res: AxiosResponse<ServerResponseInterface>) => {
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
    <NavigationLoader>
      <div className="h-screen bg-violet-950 flex justify-center items-center">
        <div className="overflow-auto bg-white rounded-lg h-5/6 w-full mx-4 md:w-3/5 p-5 flex flex-col justify-between">
          <div className="h-1/2 flex flex-col items-center place-content-center gap-5">
            <h1 className="text-2xl font-bold text-violet-950">Log In</h1>

            <div className="rounded-full h-28 w-28 flex bg-violet-950">
              <Icon
                color="white"
                height="50%"
                width="50%"
                className="m-auto"
                name="Lock"
              ></Icon>
            </div>
          </div>
          <div>
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
            <div>
              <PrimaryButton
                text="Log In"
                form="login-form"
                type="submit"
                className={`float-right ${
                  isSubmitting ? "bg-violet-950/50" : ""
                }`}
                disabled={isSubmitting}
              ></PrimaryButton>
            </div>
          </div>

          <div className="text-right">
            <span className="text-violet-950">
              <Link className="underline" to="/signup">
                <b>Create your account</b>
              </Link>{" "}
              if you do not have it yet
            </span>
          </div>
        </div>
      </div>
    </NavigationLoader>
  );
}
