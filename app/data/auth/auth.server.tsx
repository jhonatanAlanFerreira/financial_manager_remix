import { hash, compare } from "bcrypt";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { User } from "@prisma/client";
import { exclude } from "~/utils/utilities";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import { prisma } from "~/data/database/database.server";
import {
  LoginRequestInterface,
  SignupRequestInterface,
} from "~/data/auth/auth-request-interfaces";
import { loginValidator, signupValidator } from "~/data/auth/auth-validator";

const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET not found");
}

const sessionStorage = createCookieSessionStorage({
  cookie: {
    secure: process.env.NODE_ENV === "production",
    secrets: [SESSION_SECRET],
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    httpOnly: true,
  },
});

export async function createUserSession(userId: string) {
  const session = await sessionStorage.getSession();
  session.set("userId", userId);
  return sessionStorage.commitSession(session);
}

export async function getUserFromSession(
  request: Request
): Promise<User | null> {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  const userId = session.get("userId");

  if (!userId) {
    return null;
  }

  return await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
}

export async function requireUserSession(request: Request): Promise<User> {
  const user = await getUserFromSession(request);

  if (!user) {
    throw redirect("/login");
  }

  return user;
}

export async function signup(
  data: SignupRequestInterface
): Promise<ServerResponseInterface> {
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

  await prisma.account.create({
    data: {
      name: "Personal Account",
      user_id: user.id,
      balance: 0,
      is_personal_account: true,
    },
  });

  const userWithoutPass = exclude(user, ["password"]);

  return {
    data: userWithoutPass,
    message: "Your user and default account were created successfully",
  };
}

export async function destroyUserSession(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}

export async function login(
  data: LoginRequestInterface
): Promise<ServerResponseInterface> {
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

  const userWithoutPass = exclude(user, ["password"]);

  return {
    data: userWithoutPass,
    message: "OK",
  };
}
