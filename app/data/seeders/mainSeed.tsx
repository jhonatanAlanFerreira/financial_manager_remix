import logOperationTypeSeed from "~/data/seeders/logOperationTypeSeed";
import { prisma } from "~/data/database.server";

Promise.all([logOperationTypeSeed()])
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.log(e);
    await prisma.$disconnect();
    process.exit(1);
  });
