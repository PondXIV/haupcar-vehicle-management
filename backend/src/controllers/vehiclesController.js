const APIResponse = require('../models/apiResponse')
const vehiclesService = require('../services/vehiclesService')

const VEHICLE_TYPES = new Set(['Electric', 'Gasoline', 'Hybrid'])
const TEXT_FILTERS = ['search', 'licensePlate', 'model']
const CREATE_VEHICLE_FIELDS = new Set([
  'licensePlate',
  'brandId',
  'model',
  'vehicleType',
  'notes',
])

function validateVehicle(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object.' }
  }

  const unsupportedField = Object.keys(body).find((key) => !CREATE_VEHICLE_FIELDS.has(key))
  if (unsupportedField) {
    return { error: `Unsupported field: ${unsupportedField}.` }
  }

  if (
    typeof body.licensePlate !== 'string' ||
    !body.licensePlate.trim() ||
    body.licensePlate.trim().length > 20
  ) {
    return { error: 'licensePlate is required and must be 20 characters or fewer.' }
  }

  const brandId = typeof body.brandId === 'number'
    ? (Number.isSafeInteger(body.brandId) ? String(body.brandId) : '')
    : body.brandId
  if (typeof brandId !== 'string' || !/^[1-9]\d*$/.test(brandId)) {
    return { error: 'brandId must be a positive integer.' }
  }

  if (
    typeof body.model !== 'string' ||
    !body.model.trim() ||
    body.model.trim().length > 100
  ) {
    return { error: 'model is required and must be 100 characters or fewer.' }
  }

  if (typeof body.vehicleType !== 'string' || !VEHICLE_TYPES.has(body.vehicleType)) {
    return { error: 'vehicleType must be Electric, Gasoline, or Hybrid.' }
  }

  if (body.notes !== undefined && body.notes !== null && typeof body.notes !== 'string') {
    return { error: 'notes must be a string or null.' }
  }

  return {
    vehicleData: {
      licensePlate: body.licensePlate.trim(),
      brandId,
      model: body.model.trim(),
      vehicleType: body.vehicleType,
      notes: typeof body.notes === 'string' ? body.notes : null,
    },
  }
}

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

async function createVehicle(req, res) {
  const { vehicleData, error } = validateVehicle(req.body)
  if (error) {
    return res.status(400).json(new APIResponse(400, { error }))
  }

  try {
    const vehicle = await vehiclesService.createVehicle(vehicleData)
    return res.status(201).json(new APIResponse(201, vehicle))
  } catch (createError) {
    if (createError.code === 'P2002') {
      return res.status(409).json(
        new APIResponse(409, { error: 'License plate already exists.' })
      )
    }

    if (createError.code === 'P2003') {
      return res.status(400).json(
        new APIResponse(400, { error: 'brandId does not reference an existing vehicle brand.' })
      )
    }

    throw createError
  }
}

module.exports = { createVehicle, listVehicles }
