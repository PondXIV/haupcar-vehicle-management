const foldersService = require('../services/foldersService')
const APIResponse = require('../models/apiResponse')

function sendResponse(res, status, data = {}) {
  return res.status(status).json(new APIResponse(status, data))
}

function parseId(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    return null
  }

  const id = Number(value)
  return Number.isSafeInteger(id) ? id : null
}

function validateName(value) {
  if (typeof value !== 'string') {
    return 'Folder name is required'
  }

  const name = value.trim()
  if (!name) {
    return 'Folder name cannot be empty'
  }

  if (name.length > 255) {
    return 'Folder name must be 255 characters or fewer'
  }

  return null
}

async function listFolders(req, res) {
  const folders = await foldersService.listFolders()
  return sendResponse(res, 200, folders)
}

async function getFolder(req, res) {
  const id = parseId(req.params.id)
  if (id === null) {
    return sendResponse(res, 400, { error: 'Invalid folder id' })
  }

  const folder = await foldersService.getFolder(id)
  if (!folder) {
    return sendResponse(res, 404, { error: 'Folder not found' })
  }

  return sendResponse(res, 200, folder)
}

async function createFolder(req, res) {
  const error = validateName(req.body?.name)
  if (error) {
    return sendResponse(res, 400, { error })
  }

  const folder = await foldersService.createFolder(req.body.name.trim())
  return sendResponse(res, 201, folder)
}

async function updateFolder(req, res) {
  const id = parseId(req.params.id)
  if (id === null) {
    return sendResponse(res, 400, { error: 'Invalid folder id' })
  }

  const error = validateName(req.body?.name)
  if (error) {
    return sendResponse(res, 400, { error })
  }

  const folder = await foldersService.updateFolder(id, req.body.name.trim())
  if (!folder) {
    return sendResponse(res, 404, { error: 'Folder not found' })
  }

  return sendResponse(res, 200, folder)
}

async function deleteFolder(req, res) {
  const id = parseId(req.params.id)
  if (id === null) {
    return sendResponse(res, 400, { error: 'Invalid folder id' })
  }

  const deleted = await foldersService.deleteFolder(id)
  if (!deleted) {
    return sendResponse(res, 404, { error: 'Folder not found' })
  }

  return sendResponse(res, 200)
}

module.exports = {
  createFolder,
  deleteFolder,
  getFolder,
  listFolders,
  updateFolder,
}
