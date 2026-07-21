import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Hash the admin password
  const password = await bcrypt.hash('Mazda323!*', 10)

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@idealsrilanka.com' },
    update: { password },
    create: {
      name: 'Admin User',
      email: 'admin@idealsrilanka.com',
      mobile: '+94771234567',
      password,
      country: 'Sri Lanka',
      role: 'ADMIN',
    },
  })

  console.log('Created admin user:', admin)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
