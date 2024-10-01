import { ValidatedDataInterface } from "~/shared/validated-data-interface";
import {
  LoginRequestInterface,
  SignupRequestInterface,
} from "~/data/auth/auth-request-interfaces";
import { prisma } from "~/data/database/database.server";

export async function loginValidator(
  data: LoginRequestInterface
): Promise<ValidatedDataInterface> {
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
): Promise<ValidatedDataInterface> {
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
