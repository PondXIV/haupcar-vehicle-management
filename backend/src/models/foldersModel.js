const { prisma } = require('../db')

function serializeFolder(folder) {
  if (!folder) {
    return null
  }

  return {
    id: folder.id.toString(),
    name: folder.name,
    created_at: folder.createdAt,
    updated_at: folder.updatedAt,
  }
}

async function findAll() {
  const folders = await prisma.folder.findMany({ orderBy: { id: 'asc' } })
  return folders.map(serializeFolder)
}

async function findById(id) {
  const folder = await prisma.folder.findUnique({ where: { id: BigInt(id) } })
  return serializeFolder(folder)
}

async function create(name) {
  const folder = await prisma.folder.create({ data: { name } })
  return serializeFolder(folder)
}

async function update(id, name) {
  try {
    const folder = await prisma.folder.update({
      where: { id: BigInt(id) },
      data: { name },
    })
    return serializeFolder(folder)
  } catch (error) {
    if (error.code === 'P2025') {
      return null
    }

    throw error
  }
}

async function remove(id) {
  const result = await prisma.folder.deleteMany({ where: { id: BigInt(id) } })
  return result.count > 0
}

module.exports = { create, findAll, findById, remove, update }
