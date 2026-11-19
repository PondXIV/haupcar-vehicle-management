const assert = require('node:assert/strict')
const jwt = require('jsonwebtoken')
const { after, before, test } = require('node:test')
const express = require('express')
const vehiclesModel = require('../src/models/vehiclesModel')
const vehiclesRouter = require('../src/routes/vehicles')

const app = express()
app.use('/api/vehicles', vehiclesRouter)

let server
let baseUrl
const originalFindAll = vehiclesModel.findAll
const originalJwtSecret = process.env.JWT_SECRET
const testJwtSecret = 'test-secret-with-at-least-32-bytes-long'
let receivedFilters

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

  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve)
  })
  baseUrl = `http://127.0.0.1:${server.address().port}/api/vehicles`
})

after(async () => {
  vehiclesModel.findAll = originalFindAll
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
