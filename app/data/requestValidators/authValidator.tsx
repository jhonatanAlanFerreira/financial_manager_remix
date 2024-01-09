import ValidatedData from "~/interfaces/ValidatedData";
import SignupRequest from "~/interfaces/bodyRequests/SignupRequest";
import { prisma } from "~/data/database.server";

export async function signupValidator(
  data: SignupRequest
): Promise<ValidatedData> {
  if (data.password != data.passwordRepeat) {
    return {
      isValid: false,
      errors: {
        password: "You sent two different passwords",
      },
    };
  }

  const loginExists = await prisma.user.findUnique({
    where: {
      login: data.login,
    },
  });

  if (loginExists !== null) {
    return {
      isValid: false,
      errors: {
        login: "The login you sent already exists",
      },
    };
  }

  return {
    isValid: true,
  };
}
