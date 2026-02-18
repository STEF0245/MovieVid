import cacheService from './cache.service.js'

const VIDEO_URL_TTL = 6 * 60 * 60 * 1000 // 6 hours

/**
 * List of available video providers with their embed URL patterns
 */
const PROVIDERS = {
	vidsrc: {
		name: 'VidSrc',
		getUrl: (id, options = {}) => {
			const type = options.type
				? String(options.type).toLowerCase()
				: 'movie'
			const season = Number.parseInt(options.season, 10) || 1
			const episode = Number.parseInt(options.episode, 10) || 1

			if (type === 'series' || type === 'tv') {
				return `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`
			} else {
				return `https://vidsrc.to/embed/movie/${id}`
			}
		}
	},
	vidsrccc: {
		name: 'VidSrc.cc',
		getUrl: (id, options = {}) => {
			const type = options.type
				? String(options.type).toLowerCase()
				: 'movie'
			const season = Number.parseInt(options.season, 10) || 1
			const episode = Number.parseInt(options.episode, 10) || 1

			if (type === 'series' || type === 'tv') {
				return `https://vidsrc.cc/v3/embed/tv/${id}/${season}/${episode}`
			} else {
				return `https://vidsrc.cc/v3/embed/movie/${id}`
			}
		}
	},
	vidlink: {
		name: 'Vidlink',
		getUrl: (id, options = {}) => {
			const type = options.type
				? String(options.type).toLowerCase()
				: 'movie'
			const season = Number.parseInt(options.season, 10) || 1
			const episode = Number.parseInt(options.episode, 10) || 1

			if (type === 'series' || type === 'tv') {
				return `https://vidlink.pro/tv/${id}/${season}/${episode}`
			} else {
				return `https://vidlink.pro/movie/${id}?primaryColor=000000&secondaryColor=ffffff&player=jw`
			}
		}
	}
}

/**
 * Get list of available providers
 */
export function getAvailableProviders() {
	return Object.keys(PROVIDERS).map((key) => ({
		id: key,
		name: PROVIDERS[key].name
	}))
}

/**
 * Get embed URL from specified provider
 * @param {string} id - TMDB ID
 * @param {string} provider - Provider ID (vidsrc, vidlink, etc.)
 * @param {object} options - Video options (type, season, episode)
 * @returns {string|null} - Embed URL or null
 */
export function getEmbedUrl(id, provider = 'vidsrc', options = {}) {
	if (!PROVIDERS[provider]) {
		provider = 'vidsrc' // Fallback to default
	}

	const type = options.type ? String(options.type).toLowerCase() : 'movie'
	const season = Number.parseInt(options.season, 10) || 1
	const episode = Number.parseInt(options.episode, 10) || 1

	const cacheKey = `embedUrl:${id}:${provider}:${type}:${season}:${episode}`
	const cachedUrl = cacheService.get(cacheKey, VIDEO_URL_TTL)
	if (cachedUrl) return cachedUrl

	const embedUrl = PROVIDERS[provider].getUrl(id, { type, season, episode })
	cacheService.set(cacheKey, embedUrl)
	return embedUrl
}

export default { getEmbedUrl, getAvailableProviders }
