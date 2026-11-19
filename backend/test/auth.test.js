const assert = require('node:assert/strict')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { after, before, test } = require('node:test')
const express = require('express')
const { getJwtSecret } = require('../src/config/auth')
const authUsersModel = require('../src/models/authUsersModel')
const authRouter = require('../src/routes/auth')

const app = express()
app.use(express.json())
app.use('/api/auth', authRouter)

let server
let baseUrl
const originalFindByUsername = authUsersModel.findByUsername
const originalJwtSecret = process.env.JWT_SECRET
const testJwtSecret = 'test-secret-with-at-least-32-bytes-long'
let user

before(async () => {
  process.env.JWT_SECRET = testJwtSecret
  user = {
    id: 1n,
    username: 'Somchai',
    passwordHash: await bcrypt.hash('1234', 4),
  }
  authUsersModel.findByUsername = async (username) =>
    username === user.username ? user : null

  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve)
  })
  baseUrl = `http://127.0.0.1:${server.address().port}/api/auth/login`
})

after(async () => {
  authUsersModel.findByUsername = originalFindByUsername
  if (originalJwtSecret === undefined) {
    delete process.env.JWT_SECRET
  } else {
    process.env.JWT_SECRET = originalJwtSecret
  }

  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
})

test('returns a signed JWT for valid credentials', async () => {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'Somchai', password: '1234' }),
  })
  assert.equal(response.status, 200)

  const result = await response.json()
  assert.equal(result.Status, 200)
  assert.equal(result.Data.tokenType, 'Bearer')
  assert.equal(result.Data.expiresIn, 3600)
  assert.deepEqual(result.Data.user, { id: '1', username: 'Somchai' })
  assert.equal('passwordHash' in result.Data, false)

  const payload = jwt.verify(result.Data.token, testJwtSecret, {
    issuer: 'haupcar-vehicle-management',
  })
  assert.equal(payload.sub, '1')
  assert.equal(payload.username, 'Somchai')
})

test('rejects invalid credentials without disclosing which value is incorrect', async () => {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'Somchai', password: 'incorrect' }),
  })

  assert.equal(response.status, 401)
  assert.deepEqual(await response.json(), {
    Status: 401,
    Data: { error: 'Invalid username or password.' },
  })
})

test('rejects missing credentials', async () => {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'Somchai' }),
  })

  assert.equal(response.status, 400)
  assert.equal((await response.json()).Status, 400)
})

test('requires a strong JWT secret', () => {
  process.env.JWT_SECRET = 'short'
  assert.throws(() => getJwtSecret(), /at least 32 bytes/)
  process.env.JWT_SECRET = testJwtSecret
})
