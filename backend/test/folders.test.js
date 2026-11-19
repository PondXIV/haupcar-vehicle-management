const assert = require('node:assert/strict')
const { after, before, test } = require('node:test')
const express = require('express')
const foldersModel = require('../src/models/foldersModel')
const foldersRouter = require('../src/routes/folders')

const app = express()
app.use(express.json())
app.use('/api/folders', foldersRouter)

let server
let baseUrl
let folders = []
let nextId = 1
const originalMethods = {
  create: foldersModel.create,
  findAll: foldersModel.findAll,
  findById: foldersModel.findById,
  remove: foldersModel.remove,
  update: foldersModel.update,
}

function createFolder(name) {
  const now = new Date().toISOString()
  const folder = {
    id: String(nextId++),
    name,
    created_at: now,
    updated_at: now,
  }
  folders.push(folder)
  return folder
}

before(async () => {
  foldersModel.findAll = async () => [...folders].sort((a, b) => Number(a.id) - Number(b.id))
  foldersModel.findById = async (id) => folders.find((folder) => folder.id === String(id)) ?? null
  foldersModel.create = async (name) => createFolder(name)
  foldersModel.update = async (id, name) => {
    const folder = folders.find((item) => item.id === String(id))
    if (!folder) {
      return null
    }
    folder.name = name
    folder.updated_at = new Date().toISOString()
    return folder
  }
  foldersModel.remove = async (id) => {
    const initialLength = folders.length
    folders = folders.filter((item) => item.id !== String(id))
    return initialLength > folders.length
  }

  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve)
  })
  baseUrl = `http://127.0.0.1:${server.address().port}/api/folders`
})

after(async () => {
  Object.assign(foldersModel, originalMethods)
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
})

test('creates, reads, renames, and deletes folders', async () => {
  const createResponse = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: ' Documents ' }),
  })
  assert.equal(createResponse.status, 201)
  const createResult = await createResponse.json()
  assert.equal(createResult.Status, 201)
  const created = createResult.Data
  assert.equal(created.name, 'Documents')
  assert.ok(created.created_at)
  assert.ok(created.updated_at)

  const listResponse = await fetch(baseUrl)
  const listResult = await listResponse.json()
  assert.equal(listResult.Status, 200)
  assert.deepEqual(listResult.Data.map(({ name }) => name), ['Documents'])

  const updateResponse = await fetch(`${baseUrl}/${created.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Archive' }),
  })
  assert.equal(updateResponse.status, 200)
  const updateResult = await updateResponse.json()
  assert.equal(updateResult.Status, 200)
  assert.equal(updateResult.Data.name, 'Archive')

  const getResponse = await fetch(`${baseUrl}/${created.id}`)
  assert.equal((await getResponse.json()).Data.name, 'Archive')

  const deleteResponse = await fetch(`${baseUrl}/${created.id}`, { method: 'DELETE' })
  assert.equal(deleteResponse.status, 200)
  assert.deepEqual(await deleteResponse.json(), { Status: 200, Data: {} })

  const missingResponse = await fetch(`${baseUrl}/${created.id}`)
  assert.equal(missingResponse.status, 404)
})

test('rejects invalid folder names and ids', async () => {
  const createResponse = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '   ' }),
  })
  assert.equal(createResponse.status, 400)
  assert.deepEqual(await createResponse.json(), {
    Status: 400,
    Data: { error: 'Folder name cannot be empty' },
  })

  const getResponse = await fetch(`${baseUrl}/not-an-id`)
  assert.equal(getResponse.status, 400)
  assert.equal((await getResponse.json()).Status, 400)
})
