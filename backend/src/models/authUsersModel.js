const { prisma } = require('../db')

async function findByUsername(username) {
  return prisma.authUser.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      passwordHash: true,
    },
  })
}

module.exports = { findByUsername }
