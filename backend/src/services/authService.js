const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authUsersModel = require('../models/authUsersModel')
const { getJwtSecret } = require('../config/auth')

const TOKEN_EXPIRES_IN_SECONDS = 60 * 60

async function login(username, password) {
  const user = await authUsersModel.findByUsername(username)
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return null
  }

  const token = jwt.sign(
    { username: user.username },
    getJwtSecret(),
    {
      subject: user.id.toString(),
      issuer: 'haupcar-vehicle-management',
      expiresIn: TOKEN_EXPIRES_IN_SECONDS,
    }
  )

  return {
    token,
    tokenType: 'Bearer',
    expiresIn: TOKEN_EXPIRES_IN_SECONDS,
    user: {
      id: user.id.toString(),
      username: user.username,
    },
  }
}

module.exports = { login }
