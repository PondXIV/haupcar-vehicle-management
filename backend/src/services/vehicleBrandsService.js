const vehicleBrandsModel = require('../models/vehicleBrandsModel')

async function listVehicleBrands() {
  return vehicleBrandsModel.findAll()
}

async function getVehicleBrand(id) {
  return vehicleBrandsModel.findById(id)
}

async function createVehicleBrand(name) {
  return vehicleBrandsModel.create(name)
}

async function updateVehicleBrand(id, name) {
  return vehicleBrandsModel.update(id, name)
}

async function deleteVehicleBrand(id) {
  return vehicleBrandsModel.remove(id)
}

module.exports = {
  createVehicleBrand,
  deleteVehicleBrand,
  getVehicleBrand,
  listVehicleBrands,
  updateVehicleBrand,
}
