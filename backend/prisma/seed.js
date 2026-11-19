const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const seedAuthUser = {
  username: 'Somchai',
  password: '1234',
}

const vehicleBrands = [
  'Toyota',
  'Honda',
  'Nissan',
  'Mazda',
  'Mitsubishi',
  'Suzuki',
  'Isuzu',
  'Ford',
  'BMW',
  'Mercedes-Benz',
  'Hyundai',
  'Kia',
  'BYD',
  'Tesla',
]

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('The development auth-user seeder cannot run in production.')
  }

  for (const name of vehicleBrands) {
    await prisma.vehicleBrand.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  console.log(`Seeded ${vehicleBrands.length} vehicle brands.`)

  const toyota = await prisma.vehicleBrand.findUniqueOrThrow({
    where: { name: 'Toyota' },
    select: { id: true },
  })

  await prisma.vehicle.upsert({
    where: { licensePlate: 'DEMO-001' },
    update: {},
    create: {
      licensePlate: 'DEMO-001',
      brandId: toyota.id,
      model: 'Corolla',
      vehicleType: 'Gasoline',
      notes: 'Sample vehicle for development.',
    },
  })

  console.log('Seeded sample vehicle DEMO-001.')

  const passwordHash = await bcrypt.hash(seedAuthUser.password, 12)
  await prisma.authUser.upsert({
    where: { username: seedAuthUser.username },
    update: {},
    create: { username: seedAuthUser.username, passwordHash },
  })

  console.log('Seeded auth user without overwriting an existing account.')
}

main()
  .catch((error) => {
    console.error('Failed to seed data:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
