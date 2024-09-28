import ValidatedData from "~/interfaces/ValidatedData";
import { prisma } from "../database/database.server";
import { LoginRequestInterface, SignupRequestInterface } from "./auth-request-interfaces";

export async function loginValidator(
  data: LoginRequestInterface
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

export async function signupValidator(
  data: SignupRequestInterface
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