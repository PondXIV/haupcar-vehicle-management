const { prisma } = require('../db')

async function findAll(filters = {}) {
  const conditions = []

  if (filters.search) {
    conditions.push({
      OR: [
        { licensePlate: { contains: filters.search, mode: 'insensitive' } },
        { model: { contains: filters.search, mode: 'insensitive' } },
        {
          brand: {
            is: { name: { contains: filters.search, mode: 'insensitive' } },
          },
        },
      ],
    })
  }

  if (filters.licensePlate) {
    conditions.push({
      licensePlate: { contains: filters.licensePlate, mode: 'insensitive' },
    })
  }

  if (filters.brandId !== undefined) {
    conditions.push({ brandId: BigInt(filters.brandId) })
  }

  if (filters.model) {
    conditions.push({ model: { contains: filters.model, mode: 'insensitive' } })
  }

  if (filters.vehicleType) {
    conditions.push({ vehicleType: filters.vehicleType })
  }

  const vehicles = await prisma.vehicle.findMany({
    where: conditions.length ? { AND: conditions } : undefined,
    orderBy: { id: 'asc' },
    include: {
      brand: {
        select: { id: true, name: true },
      },
    },
  })

  return vehicles.map((vehicle) => ({
    id: vehicle.id.toString(),
    license_plate: vehicle.licensePlate,
    brand_id: vehicle.brandId.toString(),
    brand: {
      id: vehicle.brand.id.toString(),
      name: vehicle.brand.name,
    },
    model: vehicle.model,
    vehicle_type: vehicle.vehicleType,
    notes: vehicle.notes,
    created_at: vehicle.createdAt,
    updated_at: vehicle.updatedAt,
  }))
}

module.exports = { findAll }
