import express from 'express'
import { checkAuth } from '../middleware/auth.middleware.js'
import {
	getMoviePage,
	streamMovie,
	getMovieImage,
} from '../controllers/movie.controller.js'

const router = express.Router()

router.get('/movie/:id', checkAuth, getMoviePage)
router.get('/movie/:id/stream', checkAuth, streamMovie)
router.get('/movie/:id/image', checkAuth, getMovieImage)

export default router
