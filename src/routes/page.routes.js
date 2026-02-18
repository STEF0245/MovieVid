import express from 'express'
import { checkAuth } from '../middleware/auth.middleware.js'
import {
	renderHome,
	renderMovies,
	renderSeries,
	renderGenres
} from '../controllers/page.controller.js'

const router = express.Router()

router.get('/', checkAuth, renderHome)
router.get('/movies', checkAuth, renderMovies)
router.get('/series', checkAuth, renderSeries)
router.get('/genres', checkAuth, renderGenres)

export default router
