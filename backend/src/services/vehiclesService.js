const vehiclesModel = require('../models/vehiclesModel')

async function listVehicles(filters) {
  return vehiclesModel.findAll(filters)
}

async function createVehicle(vehicleData) {
  return vehiclesModel.create(vehicleData)
}

module.exports = { createVehicle, listVehicles }
