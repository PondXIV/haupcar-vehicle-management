const assert = require('node:assert/strict')
const jwt = require('jsonwebtoken')
const { after, before, test } = require('node:test')
const express = require('express')
const vehicleBrandsModel = require('../src/models/vehicleBrandsModel')
const vehicleBrandsRouter = require('../src/routes/vehicleBrands')

const app = express()
app.use(express.json())
app.use('/api/vehicle-brands', vehicleBrandsRouter)

let server
let baseUrl
let brands = []
let nextId = 1
const originalMethods = {
  create: vehicleBrandsModel.create,
  findAll: vehicleBrandsModel.findAll,
  findById: vehicleBrandsModel.findById,
  remove: vehicleBrandsModel.remove,
  update: vehicleBrandsModel.update,
}
const originalJwtSecret = process.env.JWT_SECRET
const testJwtSecret = 'test-secret-with-at-least-32-bytes-long'

function createBrand(name) {
  const now = new Date().toISOString()
  const brand = {
    id: String(nextId++),
    name,
    created_at: now,
    updated_at: now,
  }
  brands.push(brand)
  return brand
}

function authHeaders() {
  return { Authorization: `Bearer ${signToken()}` }
}

function signToken() {
  return jwt.sign(
    { username: 'Somchai' },
    testJwtSecret,
    {
      algorithm: 'HS256',
      subject: '1',
      issuer: 'haupcar-vehicle-management',
      expiresIn: '1h',
    }
  )
}

before(async () => {
  process.env.JWT_SECRET = testJwtSecret
  vehicleBrandsModel.findAll = async () => [...brands].sort((a, b) => a.name.localeCompare(b.name))
  vehicleBrandsModel.findById = async (id) =>
    brands.find((brand) => brand.id === String(id)) ?? null
  vehicleBrandsModel.create = async (name) => {
    if (brands.some((brand) => brand.name === name)) {
      throw { code: 'P2002' }
    }
    return createBrand(name)
  }
  vehicleBrandsModel.update = async (id, name) => {
    const brand = brands.find((item) => item.id === String(id))
    if (!brand) return null
    if (brands.some((item) => item.id !== brand.id && item.name === name)) {
      throw { code: 'P2002' }
    }
    brand.name = name
    brand.updated_at = new Date().toISOString()
    return brand
  }
  vehicleBrandsModel.remove = async (id) => {
    const brand = brands.find((item) => item.id === String(id))
    if (!brand) return false
    if (brand.name === 'In use') throw { code: 'P2003' }
    brands = brands.filter((item) => item.id !== brand.id)
    return true
  }

  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve)
  })
  baseUrl = `http://127.0.0.1:${server.address().port}/api/vehicle-brands`
})

after(async () => {
  Object.assign(vehicleBrandsModel, originalMethods)
  if (originalJwtSecret === undefined) {
    delete process.env.JWT_SECRET
  } else {
    process.env.JWT_SECRET = originalJwtSecret
  }

  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
})

test('requires a valid JWT to list vehicle brands', async () => {
  const unauthenticated = await fetch(baseUrl)
  assert.equal(unauthenticated.status, 401)

  brands = []
  createBrand('Toyota')
  createBrand('Honda')
  const authenticated = await fetch(baseUrl, {
    headers: authHeaders(),
  })

  assert.equal(authenticated.status, 200)
  const result = await authenticated.json()
  assert.equal(result.Status, 200)
  assert.deepEqual(result.Data.map((brand) => brand.name), ['Honda', 'Toyota'])
})

test('creates, reads, updates, and deletes vehicle brands', async () => {
  brands = []
  nextId = 1
  const headers = { ...authHeaders(), 'Content-Type': 'application/json' }

  const createResponse = await fetch(baseUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: ' Toyota ' }),
  })
  assert.equal(createResponse.status, 201)
  const created = (await createResponse.json()).Data
  assert.equal(created.name, 'Toyota')
  assert.ok(created.created_at)
  assert.ok(created.updated_at)

  const getResponse = await fetch(`${baseUrl}/${created.id}`, { headers: authHeaders() })
  assert.equal((await getResponse.json()).Data.name, 'Toyota')

  const updateResponse = await fetch(`${baseUrl}/${created.id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ name: 'Lexus' }),
  })
  assert.equal(updateResponse.status, 200)
  assert.equal((await updateResponse.json()).Data.name, 'Lexus')

  const deleteResponse = await fetch(`${baseUrl}/${created.id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  assert.equal(deleteResponse.status, 200)
  assert.deepEqual(await deleteResponse.json(), { Status: 200, Data: {} })

  const missingResponse = await fetch(`${baseUrl}/${created.id}`, { headers: authHeaders() })
  assert.equal(missingResponse.status, 404)
})

test('validates vehicle brand input and handles conflicts', async () => {
  brands = []
  nextId = 1
  createBrand('Toyota')
  createBrand('In use')
  const headers = { ...authHeaders(), 'Content-Type': 'application/json' }

  for (const name of ['', '   ', 'x'.repeat(101)]) {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name }),
    })
    assert.equal(response.status, 400)
  }

  const duplicateResponse = await fetch(baseUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: 'Toyota' }),
  })
  assert.equal(duplicateResponse.status, 409)

  const updateDuplicateResponse = await fetch(`${baseUrl}/2`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ name: 'Toyota' }),
  })
  assert.equal(updateDuplicateResponse.status, 409)

  const invalidIdResponse = await fetch(`${baseUrl}/0`, { headers: authHeaders() })
  assert.equal(invalidIdResponse.status, 400)

  const deleteInUseResponse = await fetch(`${baseUrl}/2`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  assert.equal(deleteInUseResponse.status, 409)
})
