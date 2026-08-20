import { hash } from "bcryptjs";
import { prisma } from "../src/lib/prisma";

const SUPER_ADMINS = [
  { email: process.env.SUPER_ADMIN_1_EMAIL!, password: process.env.SUPER_ADMIN_1_PASSWORD! },
  { email: process.env.SUPER_ADMIN_2_EMAIL!, password: process.env.SUPER_ADMIN_2_PASSWORD! },
];

async function main() {
  for (const admin of SUPER_ADMINS) {
    if (!admin.email || !admin.password) {
      console.log(`Missing credentials for an admin, skipping...`);
      continue;
    }
    
    const hashed = await hash(admin.password, 12);
    const user = await prisma.user.upsert({
      where: { email: admin.email },
      update: { password: hashed },
      create: { email: admin.email, password: hashed, emailVerified: new Date() },
    });
    await prisma.platformUser.upsert({
      where: { userId: user.id },
      update: { role: "SUPER_ADMIN" },
      create: { userId: user.id, role: "SUPER_ADMIN" },
    });
    console.log(`Seeded Super Admin: ${admin.email}`);
  }
}

main().finally(() => prisma.$disconnect());
