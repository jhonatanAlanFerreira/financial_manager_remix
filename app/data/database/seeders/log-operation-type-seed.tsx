import { prisma } from "../database.server";

export default async function main() {
  await prisma.logOperationType.upsert({
    where: { name: "Create" },
    update: {},
    create: {
      name: "Create",
    },
  });

  await prisma.logOperationType.upsert({
    where: { name: "Update" },
    update: {},
    create: {
      name: "Update",
    },
  });

  await prisma.logOperationType.upsert({
    where: { name: "Delete" },
    update: {},
    create: {
      name: "Delete",
    },
  });
}
