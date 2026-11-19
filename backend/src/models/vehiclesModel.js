const { prisma } = require('../db')

function serializeVehicle(vehicle) {
  return {
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
  }
}

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

  return vehicles.map(serializeVehicle)
}

async function create(vehicleData) {
  const vehicle = await prisma.vehicle.create({
    data: {
      licensePlate: vehicleData.licensePlate,
      brandId: BigInt(vehicleData.brandId),
      model: vehicleData.model,
      vehicleType: vehicleData.vehicleType,
      notes: vehicleData.notes,
    },
    include: {
      brand: {
        select: { id: true, name: true },
      },
    },
  })

  return serializeVehicle(vehicle)
}

async function update(id, vehicleData) {
  try {
    const vehicle = await prisma.vehicle.update({
      where: { id: BigInt(id) },
      data: {
        licensePlate: vehicleData.licensePlate,
        brandId: BigInt(vehicleData.brandId),
        model: vehicleData.model,
        vehicleType: vehicleData.vehicleType,
        notes: vehicleData.notes,
      },
      include: {
        brand: {
          select: { id: true, name: true },
        },
      },
    })

    return serializeVehicle(vehicle)
  } catch (error) {
    if (error.code === 'P2025') {
      return null
    }

    throw error
  }
}

async function remove(id) {
  const result = await prisma.vehicle.deleteMany({ where: { id: BigInt(id) } })
  return result.count > 0
}

module.exports = { create, findAll, remove, update }
