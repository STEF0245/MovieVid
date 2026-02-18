import express from 'express'
import { resizeImage } from '../controllers/image.controller.js'

const router = express.Router()
router.get('/', resizeImage)

export default router
