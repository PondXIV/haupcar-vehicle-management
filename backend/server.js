require('dotenv').config()

const cors = require('cors')
const express = require('express')
const APIResponse = require('./src/models/apiResponse')
const { getJwtSecret } = require('./src/config/auth')
const { initializeDatabase, prisma } = require('./src/db')
const authRouter = require('./src/routes/auth')
const foldersRouter = require('./src/routes/folders')
const vehicleBrandsRouter = require('./src/routes/vehicleBrands')
const vehiclesRouter = require('./src/routes/vehicles')

const app = express()

app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use('/api/auth', authRouter)
app.use('/api/folders', foldersRouter)
app.use('/api/vehicle-brands', vehicleBrandsRouter)
app.use('/api/vehicles', vehiclesRouter)

app.use((req, res) => {
  res.status(404).json(new APIResponse(404, { error: 'Route not found' }))
})

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json(new APIResponse(400, { error: 'Invalid JSON body' }))
  }

  console.error(err)
  return res.status(500).json(new APIResponse(500, { error: 'Internal server error' }))
})

const port = Number(process.env.PORT) || 5000

Promise.resolve()
  .then(() => getJwtSecret())
  .then(() => initializeDatabase())
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend API listening on port ${port}`)
    })
  })
  .catch(async (err) => {
    console.error('Failed to initialize database:', err)
    await prisma.$disconnect()
    process.exitCode = 1
  })
