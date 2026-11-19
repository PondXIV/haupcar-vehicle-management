require('dotenv').config()

const cors = require('cors')
const express = require('express')
const { initializeDatabase, pool } = require('./src/db')
const foldersRouter = require('./src/routes/folders')

const app = express()

app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use('/api/folders', foldersRouter)

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' })
  }

  console.error(err)
  return res.status(500).json({ error: 'Internal server error' })
})

const port = Number(process.env.PORT) || 5000

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend API listening on port ${port}`)
    })
  })
  .catch(async (err) => {
    console.error('Failed to initialize database:', err)
    await pool.end()
    process.exitCode = 1
  })
