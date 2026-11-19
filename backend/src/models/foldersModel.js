const { pool } = require('../db')

async function findAll() {
  const { rows } = await pool.query(
    'SELECT id, name, created_at, updated_at FROM folders ORDER BY id'
  )
  return rows
}

async function findById(id) {
  const { rows } = await pool.query(
    'SELECT id, name, created_at, updated_at FROM folders WHERE id = $1',
    [id]
  )
  return rows[0] ?? null
}

async function create(name) {
  const { rows } = await pool.query(
    'INSERT INTO folders (name) VALUES ($1) RETURNING id, name, created_at, updated_at',
    [name]
  )
  return rows[0]
}

async function update(id, name) {
  const { rows } = await pool.query(
    `UPDATE folders
     SET name = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, name, created_at, updated_at`,
    [name, id]
  )
  return rows[0] ?? null
}

async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM folders WHERE id = $1', [id])
  return rowCount > 0
}

module.exports = { create, findAll, findById, remove, update }
