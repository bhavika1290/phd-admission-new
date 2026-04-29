import prisma from './services/prismaClient.js';

const admins = [
  { email: '2023mcb1318@iitrpr.ac.in', name: 'Primary Admin',   isAdmin: true }, { email: 'sharmasmily536@gmail.com', name: 'Smily Sharma', isAdmin: true },
]

async function seedAdmins() {
  for (const admin of admins) {
    const result = await prisma.user.upsert({
      where:  { email: admin.email },
      update: { isAdmin: true, name: admin.name },
      create: admin,
    })
    console.log(`✅ Admin seeded: ${result.email} (id: ${result.id})`)
  }
}

seedAdmins()
  .catch(e => console.error('❌ Error seeding admins:', e))
  .finally(() => prisma.$disconnect())
