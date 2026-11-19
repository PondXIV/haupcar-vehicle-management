const vehiclesModel = require('../models/vehiclesModel')

async function listVehicles(filters) {
  return vehiclesModel.findAll(filters)
}

async function createVehicle(vehicleData) {
  return vehiclesModel.create(vehicleData)
}

async function deleteVehicle(id) {
  return vehiclesModel.remove(id)
}

module.exports = { createVehicle, deleteVehicle, listVehicles }
