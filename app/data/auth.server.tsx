import { prisma } from "~/data/database.server";
import SignupRequest from "~/interfaces/bodyRequests/SignupRequest";
import { signupValidator } from "~/data/requestValidators/authValidator";
import ServerResponse from "~/interfaces/ServerResponse";

export async function signup(data: SignupRequest): Promise<ServerResponse> {
  const dataIsValid = signupValidator(data);

  if (!dataIsValid.isValid) {
    return {
      error: true,
      message: "There are some errors in your form",
      data: dataIsValid,
    };
  }

  const user = await prisma.user.create({
    data: {
      name: data.name,
      login: data.login,
      password: data.password,
    },
  });

  return {
    data: user,
    message: "Your user was created successfully",
  };
}
