import { Form, Link, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { PrimaryButton } from "~/components/buttons/primary-button/primary-button";
import { Icon } from "~/components/icon/icon";
import { InputPassword } from "~/components/inputs/input-password/input-password";
import { InputText } from "~/components/inputs/input-text/input-text";
import { NavigationLoader } from "~/components/navigation-loader/navigation-loader";
import { signup } from "~/data/frontend-services/auth-service";
import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";

export default function Signup() {
  const [responseErrors, setResponseErrors] =
    useState<ServerResponseErrorInterface>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  const formSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);

    await signup(formData, {
      onSuccess: () => {
        navigate("/");
      },
      onError: (errors) => {
        setResponseErrors(errors);
      },
      onFinally: () => {
        setTimeout(() => setIsSubmitting(false), 500);
      },
    });
  };

  return (
    <NavigationLoader>
      <div className="h-screen bg-violet-950 flex justify-center items-center">
        <div className="overflow-auto bg-white rounded-lg h-5/6 w-full mx-4 md:w-3/5 p-5 flex flex-col justify-between">
          <div className="h-1/2 flex flex-col items-center place-content-center gap-5">
            <h1 className="text-2xl font-bold text-violet-950">Sign Up</h1>

            <div className="rounded-full h-28 w-28 flex bg-violet-950">
              <Icon
                color="white"
                height="50%"
                width="50%"
                className="m-auto"
                name="UserPlus"
              ></Icon>
            </div>
          </div>

          <div className="h-full">
            <Form method="post" id="signup-form" onSubmit={formSubmit}>
              <InputText label="Name" name="name" required></InputText>
              <InputText
                label="Login"
                name="login"
                required
                errorMessage={responseErrors?.errors?.["login"]}
              ></InputText>
              <InputPassword
                showEyeIcon={true}
                label="Password"
                name="password"
                required
                errorMessage={responseErrors?.errors?.["password"]}
              ></InputPassword>
              <InputPassword
                showEyeIcon={true}
                label="Repeat Password"
                name="passwordRepeat"
                required
                errorMessage={responseErrors?.errors?.["password"]}
              ></InputPassword>
            </Form>
            <div>
              <PrimaryButton
                text="Sign Up"
                form="signup-form"
                type="submit"
                className={`float-right ${
                  isSubmitting ? "bg-violet-950/50" : ""
                }`}
                disabled={isSubmitting}
              ></PrimaryButton>
            </div>
          </div>

          <div className="text-right mt-2">
            <span className="text-violet-950">
              Go to{" "}
              <Link className="underline" to="/login">
                <b>login</b>
              </Link>{" "}
              if you already have an account
            </span>
          </div>
        </div>
      </div>
    </NavigationLoader>
  );
}
