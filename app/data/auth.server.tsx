import { prisma } from "~/data/database.server";
import SignupRequest from "~/interfaces/bodyRequests/SignupRequest";
import { signupValidator } from "~/data/requestValidators/authValidator";
import ServerResponse from "~/interfaces/ServerResponse";
import { hash, compare } from "bcrypt";
import { exclude } from "utilities";
import LoginRequest from "~/interfaces/bodyRequests/LoginRequest";
import { loginValidator } from "./requestValidators/loginValidator";

export async function signup(data: SignupRequest): Promise<ServerResponse> {
  const dataIsValid = await signupValidator(data);

  if (!dataIsValid.isValid) {
    return {
      error: true,
      message: "There are some errors in your form",
      data: dataIsValid,
    };
  }

  const passwordHash = await hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      login: data.login,
      password: passwordHash,
    },
  });

  const userWithoutPass = exclude(user, ["password"]);

  return {
    data: userWithoutPass,
    message: "Your user was created successfully",
  };
}

export async function login(data: LoginRequest): Promise<ServerResponse> {
  const dataIsValid = await loginValidator(data);

  if (!dataIsValid.isValid) {
    return {
      error: true,
      message: "There are some errors in your form",
      data: dataIsValid,
    };
  }

  const user = await prisma.user.findFirst({
    where: {
      login: data.login,
    },
  });

  if (!user) {
    return {
      error: true,
      message: "Login or password is invalid",
    };
  }

  const validPass = await compare(data.password, user.password);

  if (!validPass) {
    return {
      error: true,
      message: "Login or password is invalid",
    };
  }

  return {
    message: "WIP",
  };
}
