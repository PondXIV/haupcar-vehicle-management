const foldersService = require('../services/foldersService')

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
  return res.json(folders)
}

async function getFolder(req, res) {
  const id = parseId(req.params.id)
  if (id === null) {
    return res.status(400).json({ error: 'Invalid folder id' })
  }

  const folder = await foldersService.getFolder(id)
  if (!folder) {
    return res.status(404).json({ error: 'Folder not found' })
  }

  return res.json(folder)
}

async function createFolder(req, res) {
  const error = validateName(req.body?.name)
  if (error) {
    return res.status(400).json({ error })
  }

  const folder = await foldersService.createFolder(req.body.name.trim())
  return res.status(201).json(folder)
}

async function updateFolder(req, res) {
  const id = parseId(req.params.id)
  if (id === null) {
    return res.status(400).json({ error: 'Invalid folder id' })
  }

  const error = validateName(req.body?.name)
  if (error) {
    return res.status(400).json({ error })
  }

  const folder = await foldersService.updateFolder(id, req.body.name.trim())
  if (!folder) {
    return res.status(404).json({ error: 'Folder not found' })
  }

  return res.json(folder)
}

async function deleteFolder(req, res) {
  const id = parseId(req.params.id)
  if (id === null) {
    return res.status(400).json({ error: 'Invalid folder id' })
  }

  const deleted = await foldersService.deleteFolder(id)
  if (!deleted) {
    return res.status(404).json({ error: 'Folder not found' })
  }

  return res.status(204).end()
}

module.exports = {
  createFolder,
  deleteFolder,
  getFolder,
  listFolders,
  updateFolder,
}
