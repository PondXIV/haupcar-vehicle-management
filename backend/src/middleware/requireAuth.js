const jwt = require('jsonwebtoken')
const APIResponse = require('../models/apiResponse')
const { getJwtSecret } = require('../config/auth')

function requireAuth(req, res, next) {
  const authorization = req.get('authorization')
  const match = typeof authorization === 'string'
    ? authorization.match(/^Bearer ([^\s]+)$/i)
    : null

  if (!match) {
    return res.status(401).json(
      new APIResponse(401, { error: 'A valid Bearer token is required.' })
    )
  }

  try {
    const payload = jwt.verify(match[1], getJwtSecret(), {
      algorithms: ['HS256'],
      issuer: 'haupcar-vehicle-management',
    })

    if (
      typeof payload === 'string' ||
      typeof payload.sub !== 'string' ||
      !/^[1-9]\d*$/.test(payload.sub) ||
      typeof payload.username !== 'string' ||
      !payload.username
    ) {
      return res.status(401).json(
        new APIResponse(401, { error: 'Invalid or expired token.' })
      )
    }

    req.auth = { id: payload.sub, username: payload.username }
    return next()
  } catch {
    return res.status(401).json(
      new APIResponse(401, { error: 'Invalid or expired token.' })
    )
  }
}

module.exports = requireAuth
