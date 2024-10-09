import {
  LoginRequestInterface,
  SignupRequestInterface,
} from "~/data/auth/auth-request-interfaces";
import { prisma } from "~/data/database/database.server";
import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";

export async function loginValidator(
  data: LoginRequestInterface
): Promise<ServerResponseErrorInterface | null> {
  if (!data.login || !data.password) {
    return {
      errorCode: 400,
      errors: {
        empty: "There are empty fields",
      },
    };
  }

  return null;
}

export async function signupValidator(
  data: SignupRequestInterface
): Promise<ServerResponseErrorInterface | null> {
  if (data.password != data.passwordRepeat) {
    return {
      errorCode: 400,
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
      errorCode: 400,
      errors: {
        login: "The login you sent already exists",
      },
    };
  }

  if (!data.login || !data.name || !data.password) {
    return {
      errorCode: 400,
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
      errorCode: 400,
      errors: {
        password:
          "Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, one digit, and one special character",
      },
    };
  }

  return null;
}
