const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const vehiclesController = require('../controllers/vehiclesController')

const router = express.Router()

router.get('/', requireAuth, vehiclesController.listVehicles)
router.post('/', requireAuth, vehiclesController.createVehicle)
router.put('/:id', requireAuth, vehiclesController.updateVehicle)
router.delete('/:id', requireAuth, vehiclesController.deleteVehicle)

module.exports = router
