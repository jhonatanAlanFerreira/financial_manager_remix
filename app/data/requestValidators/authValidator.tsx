import ValidatedData from "~/interfaces/ValidatedData";
import SignupRequest from "~/interfaces/bodyRequests/SignupRequest";

export function signupValidator(data: SignupRequest): ValidatedData {
  if (data.password != data.passwordRepeat) {
    return {
      isValid: false,
      errors: [
        {
          name: "password",
          error: "You sent two different passwords",
        },
      ],
    };
  }

  return {
    isValid: true,
  };
}