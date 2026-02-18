import express from 'express'
import {
	getVideoSource,
	getAvailableProviders
} from '../controllers/video.controller.js'

const router = express.Router()
router.get('/:id/source', getVideoSource)
router.get('/providers/list', getAvailableProviders)

export default router
