const assert = require('node:assert/strict')
const { after, before, test } = require('node:test')
const express = require('express')
const { pool } = require('../src/db')
const foldersRouter = require('../src/routes/folders')

const app = express()
app.use(express.json())
app.use('/api/folders', foldersRouter)

let server
let baseUrl
let folders = []
let nextId = 1
const originalQuery = pool.query

before(async () => {
  pool.query = async (sql, values = []) => {
    if (sql.includes('ORDER BY id')) {
      return { rows: [...folders].sort((a, b) => a.id - b.id) }
    }

    if (sql.includes('INSERT INTO folders')) {
      const now = new Date().toISOString()
      const folder = {
        id: nextId++,
        name: values[0],
        created_at: now,
        updated_at: now,
      }
      folders.push(folder)
      return { rows: [folder] }
    }

    if (sql.includes('UPDATE folders')) {
      const folder = folders.find((item) => item.id === values[1])
      if (!folder) {
        return { rows: [] }
      }
      folder.name = values[0]
      folder.updated_at = new Date().toISOString()
      return { rows: [folder] }
    }

    if (sql.includes('DELETE FROM folders')) {
      const initialLength = folders.length
      folders = folders.filter((item) => item.id !== values[0])
      return { rowCount: initialLength - folders.length }
    }

    if (sql.includes('WHERE id = $1')) {
      return { rows: folders.filter((item) => item.id === values[0]) }
    }

    throw new Error(`Unexpected SQL in test: ${sql}`)
  }

  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve)
  })
  baseUrl = `http://127.0.0.1:${server.address().port}/api/folders`
})

after(async () => {
  pool.query = originalQuery
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
  const created = await createResponse.json()
  assert.equal(created.name, 'Documents')

  const listResponse = await fetch(baseUrl)
  assert.deepEqual((await listResponse.json()).map(({ name }) => name), ['Documents'])

  const updateResponse = await fetch(`${baseUrl}/${created.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Archive' }),
  })
  assert.equal(updateResponse.status, 200)
  assert.equal((await updateResponse.json()).name, 'Archive')

  const getResponse = await fetch(`${baseUrl}/${created.id}`)
  assert.equal((await getResponse.json()).name, 'Archive')

  const deleteResponse = await fetch(`${baseUrl}/${created.id}`, { method: 'DELETE' })
  assert.equal(deleteResponse.status, 204)

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

  const getResponse = await fetch(`${baseUrl}/not-an-id`)
  assert.equal(getResponse.status, 400)
})
