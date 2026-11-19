const { prisma } = require('../db')

function serializeVehicleBrand(brand) {
  if (!brand) {
    return null
  }

  return {
    id: brand.id.toString(),
    name: brand.name,
    created_at: brand.createdAt,
    updated_at: brand.updatedAt,
  }
}

async function findAll() {
  const brands = await prisma.vehicleBrand.findMany({
    orderBy: { name: 'asc' },
  })

  return brands.map(serializeVehicleBrand)
}

async function findById(id) {
  const brand = await prisma.vehicleBrand.findUnique({ where: { id: BigInt(id) } })
  return serializeVehicleBrand(brand)
}

async function create(name) {
  const brand = await prisma.vehicleBrand.create({ data: { name } })
  return serializeVehicleBrand(brand)
}

async function update(id, name) {
  try {
    const brand = await prisma.vehicleBrand.update({
      where: { id: BigInt(id) },
      data: { name },
    })
    return serializeVehicleBrand(brand)
  } catch (error) {
    if (error.code === 'P2025') {
      return null
    }

    throw error
  }
}

async function remove(id) {
  try {
    await prisma.vehicleBrand.delete({ where: { id: BigInt(id) } })
    return true
  } catch (error) {
    if (error.code === 'P2025') {
      return false
    }

    throw error
  }
}

module.exports = { create, findAll, findById, remove, update }
