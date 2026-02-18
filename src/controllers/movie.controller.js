import path from 'path'
import { fileURLToPath } from 'url'

import imdbService from '../services/imdb.service.js'
import imageService from '../services/image.service.js'
import videoService from '../services/video.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Path to placeholder image when no poster is available
const PLACEHOLDER_IMAGE = path.join(
	__dirname,
	'..',
	'..',
	'public',
	'images',
	'poster.png'
)

export async function getMoviePage(req, res, next) {
	try {
		const movie = await imdbService.fetchTitleDetails(req.params.id)
		res.render('movie', { movie, user: req.user })
	} catch (err) {
		next(err)
	}
}

export async function streamMovie(req, res, next) {
	try {
		const videoUrl = await videoService.fetchTitleVideoUrl(req.params.id, {
			type: req.query.type,
			season: req.query.season,
			episode: req.query.episode
		})
		if (!videoUrl) return res.status(404).send('Video not found')
		const query = new URLSearchParams()
		if (req.query.type) query.set('type', req.query.type)
		if (req.query.season) query.set('season', req.query.season)
		if (req.query.episode) query.set('episode', req.query.episode)
		const suffix = query.toString() ? `?${query.toString()}` : ''
		res.redirect(`/videos/${req.params.id}/stream${suffix}`)
	} catch (err) {
		next(err)
	}
}

export async function getMovieImage(req, res, next) {
	try {
		const imageUrl = await imdbService.fetchImageUrl(req.params.id)
		if (!imageUrl) return res.status(404).sendFile(PLACEHOLDER_IMAGE)

		const cachePath = await imageService.getCachedImagePath(
			imageUrl,
			160,
			240
		)
		res.sendFile(cachePath)
	} catch (err) {
		res.status(500).sendFile(PLACEHOLDER_IMAGE)
	}
}
