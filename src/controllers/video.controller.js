import videoService from '../services/video.service.js'

function normalizeVideoQuery(query) {
	const type = query.type ? String(query.type).toLowerCase() : undefined
	const season = query.season ? Number.parseInt(query.season, 10) : undefined
	const episode = query.episode
		? Number.parseInt(query.episode, 10)
		: undefined

	return {
		type,
		season: Number.isFinite(season) ? season : undefined,
		episode: Number.isFinite(episode) ? episode : undefined
	}
}

export async function getAvailableProviders(req, res, next) {
	try {
		const providers = videoService.getAvailableProviders()
		return res.json({ providers, ok: true })
	} catch (err) {
		next(err)
	}
}

export async function getVideoSource(req, res, next) {
	try {
		const params = normalizeVideoQuery(req.query)
		const provider = req.query.provider || 'vidsrc'
		const embedUrl = videoService.getEmbedUrl(
			req.params.id,
			provider,
			params
		)

		console.log(
			'Generated embed URL for title ID:',
			req.params.id,
			'Provider:',
			provider,
			'URL:',
			embedUrl
		)

		if (!embedUrl) {
			return res.json({ url: null, ok: false })
		}

		return res.json({
			url: embedUrl,
			ok: true
		})
	} catch (err) {
		next(err)
	}
}
