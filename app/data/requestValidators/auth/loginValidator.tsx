import LoginRequest from "~/interfaces/bodyRequests/auth/LoginRequest";
import ValidatedData from "~/interfaces/ValidatedData";

export async function loginValidator(
  data: LoginRequest
): Promise<ValidatedData> {
  if (!data.login || !data.password) {
    return {
      isValid: false,
      errors: {
        empty: "There are empty fields",
      },
    };
  }

  return {
    isValid: true,
  };
}
