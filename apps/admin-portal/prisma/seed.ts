import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const enterpriseData: Prisma.enterprisesCreateInput[] = [
  {
    name: "Alice",
  },
];

export async function main() {
  for (const e of enterpriseData) {
    await prisma.enterprises.create({ data: e });
  }
}

main();
