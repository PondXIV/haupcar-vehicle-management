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

async function updateVehicle(id, vehicleData) {
  return vehiclesModel.update(id, vehicleData)
}

module.exports = { createVehicle, deleteVehicle, listVehicles, updateVehicle }
