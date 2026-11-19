const express = require('express')
const requireAuth = require('../middleware/requireAuth')
const vehicleBrandsController = require('../controllers/vehicleBrandsController')

const router = express.Router()

router.get('/', requireAuth, vehicleBrandsController.listVehicleBrands)
router.get('/:id', requireAuth, vehicleBrandsController.getVehicleBrand)
router.post('/', requireAuth, vehicleBrandsController.createVehicleBrand)
router.put('/:id', requireAuth, vehicleBrandsController.updateVehicleBrand)
router.delete('/:id', requireAuth, vehicleBrandsController.deleteVehicleBrand)

module.exports = router
