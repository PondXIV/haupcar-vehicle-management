const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const vehiclesController = require('../controllers/vehiclesController')

const router = express.Router()

router.get('/', requireAuth, vehiclesController.listVehicles)

module.exports = router
