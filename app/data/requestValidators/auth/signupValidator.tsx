import ValidatedData from "~/interfaces/ValidatedData";
import { prisma } from "~/data/database.server";
import SignupRequest from "~/interfaces/bodyRequests/auth/SignupRequest";

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

  if (!data.login || !data.name || !data.password) {
    return {
      isValid: false,
      errors: {
        empty: "There are empty fields",
      },
    };
  }

  if (
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      data.password
    )
  ) {
    return {
      isValid: false,
      errors: {
        password:
          "Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, one digit, and one special character",
      },
    };
  }

  return {
    isValid: true,
  };
}
