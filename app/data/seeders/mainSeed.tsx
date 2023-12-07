import logOperationTypeSeed from "~/data/seeders/logOperationTypeSeed";
import { prisma } from "~/data/database.server";

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
