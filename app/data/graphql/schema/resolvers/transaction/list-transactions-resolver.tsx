import { requireUserSession } from "~/data/auth/auth.server";
import { prisma } from "~/data/database/database.server";

export const listTransactions = async (
  parent: any,
  args: any,
  context: { request: Request }
) => {
  const user = await requireUserSession(context.request);

  return await prisma.transaction.findMany({
    where: {
      user_id: user.id,
    },
  });
};
