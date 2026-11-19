const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const vehiclesController = require('../controllers/vehiclesController')

const router = express.Router()

router.get('/', requireAuth, vehiclesController.listVehicles)
router.post('/', requireAuth, vehiclesController.createVehicle)

module.exports = router
