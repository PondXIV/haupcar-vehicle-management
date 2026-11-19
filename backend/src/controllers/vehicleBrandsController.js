const APIResponse = require('../models/apiResponse')
const vehicleBrandsService = require('../services/vehicleBrandsService')

function sendResponse(res, status, data = {}) {
  return res.status(status).json(new APIResponse(status, data))
}

function parseId(value) {
  return /^[1-9]\d*$/.test(value) ? value : null
}

function validateName(value) {
  if (typeof value !== 'string') {
    return 'Vehicle brand name is required'
  }

  const name = value.trim()
  if (!name) {
    return 'Vehicle brand name cannot be empty'
  }

  if (name.length > 100) {
    return 'Vehicle brand name must be 100 characters or fewer'
  }

  return null
}

async function listVehicleBrands(req, res) {
  const vehicleBrands = await vehicleBrandsService.listVehicleBrands()
  return sendResponse(res, 200, vehicleBrands)
}

async function getVehicleBrand(req, res) {
  const id = parseId(req.params.id)
  if (id === null) {
    return sendResponse(res, 400, { error: 'Invalid vehicle brand id' })
  }

  const vehicleBrand = await vehicleBrandsService.getVehicleBrand(id)
  if (!vehicleBrand) {
    return sendResponse(res, 404, { error: 'Vehicle brand not found' })
  }

  return sendResponse(res, 200, vehicleBrand)
}

async function createVehicleBrand(req, res) {
  const error = validateName(req.body?.name)
  if (error) {
    return sendResponse(res, 400, { error })
  }

  try {
    const vehicleBrand = await vehicleBrandsService.createVehicleBrand(req.body.name.trim())
    return sendResponse(res, 201, vehicleBrand)
  } catch (createError) {
    if (createError.code === 'P2002') {
      return sendResponse(res, 409, { error: 'Vehicle brand name already exists' })
    }

    throw createError
  }
}

async function updateVehicleBrand(req, res) {
  const id = parseId(req.params.id)
  if (id === null) {
    return sendResponse(res, 400, { error: 'Invalid vehicle brand id' })
  }

  const error = validateName(req.body?.name)
  if (error) {
    return sendResponse(res, 400, { error })
  }

  try {
    const vehicleBrand = await vehicleBrandsService.updateVehicleBrand(id, req.body.name.trim())
    if (!vehicleBrand) {
      return sendResponse(res, 404, { error: 'Vehicle brand not found' })
    }

    return sendResponse(res, 200, vehicleBrand)
  } catch (updateError) {
    if (updateError.code === 'P2002') {
      return sendResponse(res, 409, { error: 'Vehicle brand name already exists' })
    }

    throw updateError
  }
}

async function deleteVehicleBrand(req, res) {
  const id = parseId(req.params.id)
  if (id === null) {
    return sendResponse(res, 400, { error: 'Invalid vehicle brand id' })
  }

  try {
    const deleted = await vehicleBrandsService.deleteVehicleBrand(id)
    if (!deleted) {
      return sendResponse(res, 404, { error: 'Vehicle brand not found' })
    }

    return sendResponse(res, 200)
  } catch (deleteError) {
    if (deleteError.code === 'P2003') {
      return sendResponse(res, 409, {
        error: 'Vehicle brand cannot be deleted while vehicles use it',
      })
    }

    throw deleteError
  }
}

module.exports = {
  createVehicleBrand,
  deleteVehicleBrand,
  getVehicleBrand,
  listVehicleBrands,
  updateVehicleBrand,
}
