const express = require('express')
const foldersController = require('../controllers/foldersController')

const router = express.Router()

router.get('/', foldersController.listFolders)
router.get('/:id', foldersController.getFolder)
router.post('/', foldersController.createFolder)
router.put('/:id', foldersController.updateFolder)
router.delete('/:id', foldersController.deleteFolder)

module.exports = router
