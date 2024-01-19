import { Company, User } from "@prisma/client";
import { prisma } from "~/data/database.server";
import ServerResponse from "~/interfaces/ServerResponse";

export async function list(user: User): Promise<ServerResponse<Company[]>> {
  const companies = await prisma.company.findMany({
    where: {
      user_id: user.id,
    },
  });

  return {
    data: companies,
  };
}
