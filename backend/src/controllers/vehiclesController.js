const APIResponse = require('../models/apiResponse')
const vehiclesService = require('../services/vehiclesService')

const VEHICLE_TYPES = new Set(['Electric', 'Gasoline', 'Hybrid'])
const TEXT_FILTERS = ['search', 'licensePlate', 'model']

function getFilters(query) {
  const filters = {}

  for (const key of TEXT_FILTERS) {
    const value = query[key]
    if (value === undefined) {
      continue
    }

    if (
      typeof value !== 'string' ||
      !value.trim() ||
      value.trim().length > (key === 'licensePlate' ? 20 : 100)
    ) {
      return { error: `Invalid ${key} query parameter.` }
    }

    filters[key] = value.trim()
  }

  if (query.brandId !== undefined) {
    if (typeof query.brandId !== 'string' || !/^[1-9]\d*$/.test(query.brandId)) {
      return { error: 'brandId must be a positive integer.' }
    }
    filters.brandId = query.brandId
  }

  if (query.vehicleType !== undefined) {
    if (typeof query.vehicleType !== 'string' || !VEHICLE_TYPES.has(query.vehicleType)) {
      return { error: 'vehicleType must be Electric, Gasoline, or Hybrid.' }
    }
    filters.vehicleType = query.vehicleType
  }

  const supportedParams = new Set([...TEXT_FILTERS, 'brandId', 'vehicleType'])
  const unsupportedParam = Object.keys(query).find((key) => !supportedParams.has(key))
  if (unsupportedParam) {
    return { error: `Unsupported query parameter: ${unsupportedParam}.` }
  }

  return { filters }
}

async function listVehicles(req, res) {
  const { filters, error } = getFilters(req.query)
  if (error) {
    return res.status(400).json(new APIResponse(400, { error }))
  }

  const vehicles = await vehiclesService.listVehicles(filters)
  return res.status(200).json(new APIResponse(200, vehicles))
}

module.exports = { listVehicles }
