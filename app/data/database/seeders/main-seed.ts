import logOperationTypeSeed from "~/data/database/seeders/log-operation-type-seed";
import { prisma } from "~/data/database/database.server";

const seeders = [
  logOperationTypeSeed()
];

Promise.all(seeders)
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.log(e);
    await prisma.$disconnect();
    process.exit(1);
  });
