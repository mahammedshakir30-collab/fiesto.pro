import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const festival = await prisma.festival.findFirst();
  const vendor = await prisma.vendor.findFirst();
  console.log('FESTIVAL_ID:' + festival?.id);
  console.log('VENDOR_ID:' + vendor?.id);
}
main().finally(() => prisma.$disconnect());
