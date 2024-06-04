import { Form, Link, useNavigate } from "@remix-run/react";
import axios, { AxiosResponse, isAxiosError } from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import PrimaryButton from "~/components/buttons/primary-button/PrimaryButton";
import Icon from "~/components/icon/Icon";
import InputPassword from "~/components/inputs/inputPassword/InputPassword";
import InputText from "~/components/inputs/inputText/InputText";
import NavigationLoader from "~/components/navigationLoader/NavigationLoader";
import ServerResponse from "~/interfaces/ServerResponse";
import ValidatedData from "~/interfaces/ValidatedData";

export default function Signup() {
  const [responseErrors, setResponseErrors] = useState<
    ServerResponse<ValidatedData>
  >({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  const formSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setIsSubmitting(true);

    toast
      .promise(axios.post("/api/signup", formData), {
        loading: "Creating new user",
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
                errorMessage={responseErrors?.data?.errors?.["login"]}
              ></InputText>
              <InputPassword
                showEyeIcon={true}
                label="Password"
                name="password"
                required
                errorMessage={responseErrors?.data?.errors?.["password"]}
              ></InputPassword>
              <InputPassword
                showEyeIcon={true}
                label="Repeat Password"
                name="passwordRepeat"
                required
                errorMessage={responseErrors?.data?.errors?.["password"]}
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
