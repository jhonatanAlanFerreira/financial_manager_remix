import { prisma } from "~/data/database.server";
import SignupRequest from "~/interfaces/bodyRequests/SignupRequest";
import { signupValidator } from "~/data/requestValidators/authValidator";
import ServerResponse from "~/interfaces/ServerResponse";
import { hash } from "bcrypt";

export async function signup(data: SignupRequest): Promise<ServerResponse> {
  const dataIsValid = signupValidator(data);

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

  return {
    data: user,
    message: "Your user was created successfully",
  };
}
