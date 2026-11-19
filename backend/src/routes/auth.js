const express = require('express')
const { rateLimit } = require('express-rate-limit')
const APIResponse = require('../models/apiResponse')
const authController = require('../controllers/authController')

const router = express.Router()
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json(
      new APIResponse(429, { error: 'Too many login attempts. Try again later.' })
    )
  },
})

router.post('/login', loginLimiter, authController.login)

module.exports = router
