const APIResponse = require('../models/apiResponse')
const authService = require('../services/authService')

function sendResponse(res, status, data = {}) {
  return res.status(status).json(new APIResponse(status, data))
}

async function login(req, res) {
  const { username, password } = req.body ?? {}
  if (
    typeof username !== 'string' ||
    !username.trim() ||
    typeof password !== 'string' ||
    !password
  ) {
    return sendResponse(res, 400, { error: 'Username and password are required.' })
  }

  const result = await authService.login(username.trim(), password)
  if (!result) {
    return sendResponse(res, 401, { error: 'Invalid username or password.' })
  }

  return sendResponse(res, 200, result)
}

module.exports = { login }
