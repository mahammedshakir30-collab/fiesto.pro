import { prisma } from './src/lib/prisma';

async function main() {
  const users = await prisma.user.findMany();
  
  if (users.length === 0) {
    console.log("No users found in the database.");
    return;
  }
  
  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'SUPER_ADMIN' }
    });
    console.log(`Successfully upgraded ${user.email} to SUPER_ADMIN!`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
