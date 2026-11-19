const assert = require('node:assert/strict')
const jwt = require('jsonwebtoken')
const { after, before, test } = require('node:test')
const express = require('express')
const vehiclesModel = require('../src/models/vehiclesModel')
const vehiclesRouter = require('../src/routes/vehicles')

const app = express()
app.use(express.json())
app.use('/api/vehicles', vehiclesRouter)

let server
let baseUrl
const originalMethods = {
  create: vehiclesModel.create,
  findAll: vehiclesModel.findAll,
  remove: vehiclesModel.remove,
}
const originalJwtSecret = process.env.JWT_SECRET
const testJwtSecret = 'test-secret-with-at-least-32-bytes-long'
let receivedFilters
let receivedVehicle
let createError
let deleteResult
let receivedDeletedId

function createVehicleRecord(vehicleData) {
  const now = '2026-01-01T00:00:00.000Z'
  return {
    id: '2',
    license_plate: vehicleData.licensePlate,
    brand_id: vehicleData.brandId,
    brand: { id: vehicleData.brandId, name: 'Toyota' },
    model: vehicleData.model,
    vehicle_type: vehicleData.vehicleType,
    notes: vehicleData.notes,
    created_at: now,
    updated_at: now,
  }
}

function signToken(options = {}) {
  return jwt.sign(
    { username: 'Somchai' },
    options.secret ?? testJwtSecret,
    {
      algorithm: 'HS256',
      subject: '1',
      issuer: options.issuer ?? 'haupcar-vehicle-management',
      expiresIn: options.expiresIn ?? '1h',
    }
  )
}

before(async () => {
  process.env.JWT_SECRET = testJwtSecret
  vehiclesModel.create = async (vehicleData) => {
    receivedVehicle = vehicleData
    if (createError) throw createError
    return createVehicleRecord(vehicleData)
  }
  vehiclesModel.findAll = async (filters) => {
    receivedFilters = filters
    return [{
      id: '1',
      license_plate: 'DEMO-001',
      brand_id: '1',
      brand: { id: '1', name: 'Toyota' },
      model: 'Corolla',
      vehicle_type: 'Gasoline',
      notes: 'Sample vehicle',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    }]
  }
  vehiclesModel.remove = async (id) => {
    receivedDeletedId = id
    return deleteResult
  }

  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve)
  })
  baseUrl = `http://127.0.0.1:${server.address().port}/api/vehicles`
})

after(async () => {
  Object.assign(vehiclesModel, originalMethods)
  if (originalJwtSecret === undefined) {
    delete process.env.JWT_SECRET
  } else {
    process.env.JWT_SECRET = originalJwtSecret
  }

  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
})

test('requires a valid JWT before returning vehicles', async () => {
  const unauthenticated = await fetch(baseUrl)
  assert.equal(unauthenticated.status, 401)
  assert.deepEqual(await unauthenticated.json(), {
    Status: 401,
    Data: { error: 'A valid Bearer token is required.' },
  })

  const authenticated = await fetch(baseUrl, {
    headers: { Authorization: `Bearer ${signToken()}` },
  })
  assert.equal(authenticated.status, 200)

  const result = await authenticated.json()
  assert.equal(result.Status, 200)
  assert.equal(result.Data[0].license_plate, 'DEMO-001')
  assert.deepEqual(result.Data[0].brand, { id: '1', name: 'Toyota' })
})

test('rejects invalid, expired, and wrong-issuer tokens', async () => {
  for (const token of [
    'not-a-token',
    signToken({ secret: 'different-secret-that-is-also-32-bytes' }),
    signToken({ issuer: 'other-issuer' }),
    signToken({ expiresIn: -1 }),
  ]) {
    const response = await fetch(baseUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
    assert.equal(response.status, 401)
    assert.equal((await response.json()).Status, 401)
  }
})

test('passes supported query parameters through to the vehicle model', async () => {
  const response = await fetch(
    `${baseUrl}?search=toy&licensePlate=demo&brandId=2&model=cor&vehicleType=Gasoline`,
    { headers: { Authorization: `Bearer ${signToken()}` } }
  )

  assert.equal(response.status, 200)
  assert.deepEqual(receivedFilters, {
    search: 'toy',
    licensePlate: 'demo',
    brandId: '2',
    model: 'cor',
    vehicleType: 'Gasoline',
  })
})

test('rejects invalid and unsupported query parameters', async () => {
  for (const query of ['brandId=0', 'vehicleType=Diesel', 'search=', 'unknown=value']) {
    const response = await fetch(`${baseUrl}?${query}`, {
      headers: { Authorization: `Bearer ${signToken()}` },
    })
    assert.equal(response.status, 400, query)
    assert.equal((await response.json()).Status, 400)
  }
})

test('creates an authenticated vehicle and returns the created record', async () => {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${signToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      licensePlate: ' NEW-123 ',
      brandId: 1,
      model: ' Corolla ',
      vehicleType: 'Hybrid',
      notes: 'Company vehicle',
    }),
  })

  assert.equal(response.status, 201)
  const result = await response.json()
  assert.equal(result.Status, 201)
  assert.deepEqual(receivedVehicle, {
    licensePlate: 'NEW-123',
    brandId: '1',
    model: 'Corolla',
    vehicleType: 'Hybrid',
    notes: 'Company vehicle',
  })
  assert.deepEqual(result.Data, createVehicleRecord(receivedVehicle))
})

test('validates vehicle creation fields', async () => {
  const headers = {
    Authorization: `Bearer ${signToken()}`,
    'Content-Type': 'application/json',
  }

  for (const body of [
    { licensePlate: '', brandId: 1, model: 'Corolla', vehicleType: 'Gasoline' },
    { licensePlate: 'CAR-1', brandId: 0, model: 'Corolla', vehicleType: 'Gasoline' },
    { licensePlate: 'CAR-1', brandId: 1, model: 'Corolla', vehicleType: 'Diesel' },
    { licensePlate: 'CAR-1', brandId: 1, model: 'Corolla', vehicleType: 'Gasoline', extra: true },
  ]) {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    assert.equal(response.status, 400)
    assert.equal((await response.json()).Status, 400)
  }
})

test('returns conflict for duplicate license plates and invalid brand references', async () => {
  const headers = {
    Authorization: `Bearer ${signToken()}`,
    'Content-Type': 'application/json',
  }
  const body = JSON.stringify({
    licensePlate: 'DUP-1',
    brandId: 1,
    model: 'Corolla',
    vehicleType: 'Gasoline',
  })

  createError = { code: 'P2002' }
  const duplicateResponse = await fetch(baseUrl, { method: 'POST', headers, body })
  assert.equal(duplicateResponse.status, 409)

  createError = { code: 'P2003' }
  const invalidBrandResponse = await fetch(baseUrl, { method: 'POST', headers, body })
  assert.equal(invalidBrandResponse.status, 400)
  createError = null
})

test('deletes an authenticated vehicle by id', async () => {
  deleteResult = true
  const response = await fetch(`${baseUrl}/2`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${signToken()}` },
  })

  assert.equal(response.status, 200)
  assert.equal(receivedDeletedId, '2')
  assert.deepEqual(await response.json(), { Status: 200, Data: {} })
})

test('validates vehicle id and returns not found for missing vehicles', async () => {
  const headers = { Authorization: `Bearer ${signToken()}` }

  const invalidResponse = await fetch(`${baseUrl}/not-an-id`, {
    method: 'DELETE',
    headers,
  })
  assert.equal(invalidResponse.status, 400)

  deleteResult = false
  const missingResponse = await fetch(`${baseUrl}/999`, {
    method: 'DELETE',
    headers,
  })
  assert.equal(missingResponse.status, 404)
  assert.deepEqual(await missingResponse.json(), {
    Status: 404,
    Data: { error: 'Vehicle not found.' },
  })
})

test('requires authentication to delete vehicles', async () => {
  const response = await fetch(`${baseUrl}/2`, { method: 'DELETE' })
  assert.equal(response.status, 401)
})
