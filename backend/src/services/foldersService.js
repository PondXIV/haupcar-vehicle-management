const foldersModel = require('../models/foldersModel')

async function listFolders() {
  return foldersModel.findAll()
}

async function getFolder(id) {
  return foldersModel.findById(id)
}

async function createFolder(name) {
  return foldersModel.create(name)
}

async function updateFolder(id, name) {
  return foldersModel.update(id, name)
}

async function deleteFolder(id) {
  return foldersModel.remove(id)
}

module.exports = {
  createFolder,
  deleteFolder,
  getFolder,
  listFolders,
  updateFolder,
}
