import fetch from 'node-fetch'
import cacheService from './cache.service.js'

// Cache TTLs
const TITLES_CACHE_TTL = 60 * 60 * 1000 // 1 hour
const TITLE_DETAILS_CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours
const GENRES_CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

async function fetchTitles(type) {
	const cacheKey = `titles:${type || 'all'}`

	// Check cache first
	const cached = cacheService.get(cacheKey, TITLES_CACHE_TTL)
	if (cached) {
		return cached
	}

	// Fetch from API
	const res = await fetch(
		`https://api.imdbapi.dev/titles${type ? `?types=${type}` : ''}`
	)
	const data = await res.json()

	const result = data.titles.map((title) => {
		if (title.primaryTitle) {
			title.title = title.primaryTitle
		}

		// Cache image URLs internally for each title
		if (title.primaryImage?.url) {
			cacheService.set(`imageUrl:${title.id}`, title.primaryImage.url)
		}

		return {
			...title,
			// internal URL only
			image: `/movie/${title.id}/image`
		}
	})

	// Cache the result
	cacheService.set(cacheKey, result)

	return result
}

async function fetchTitleDetails(id) {
	const cacheKey = `title:${id}`

	// Check cache first
	const cached = cacheService.get(cacheKey, TITLE_DETAILS_CACHE_TTL)
	if (cached) {
		return cached
	}

	// Fetch from API
	const res = await fetch(`https://api.imdbapi.dev/titles/${id}`)
	const data = await res.json()

	if (data.primaryTitle) {
		data.title = data.primaryTitle
	}

	if (data.primaryImage) {
		// Cache the original image URL internally for image service
		if (data.primaryImage.url) {
			cacheService.set(`imageUrl:${id}`, data.primaryImage.url)
		}

		data.image = `/movie/${id}/image`
		delete data.primaryImage.url // never expose original URL
	}

	// Cache the result
	cacheService.set(cacheKey, data)

	return data
}

async function fetchImageUrl(id) {
	const cacheKey = `imageUrl:${id}`

	// Check cache first
	const cached = cacheService.get(cacheKey, TITLE_DETAILS_CACHE_TTL)
	if (cached) {
		return cached
	}

	// If not cached, fetch title details (which will cache the URL)
	const details = await fetchTitleDetails(id)

	// Try to get from cache again after fetching details
	return cacheService.get(cacheKey, TITLE_DETAILS_CACHE_TTL)
}

async function fetchGenres() {
	const cacheKey = 'genres:all'

	// Check cache first
	const cached = cacheService.get(cacheKey, GENRES_CACHE_TTL)
	if (cached) {
		return cached
	}

	// Fetch from API
	const res = await fetch(`https://api.imdbapi.dev/interests`)
	const data = (await res.json()).categories

	const result = data.map((item) => ({
		category: item.category,
		image: item.interests?.[0]?.primaryImage
			? `/movie/${item.interests[0].id}/image` // if interest items have ids
			: null
	}))

	// Cache the result
	cacheService.set(cacheKey, result)

	return result
}

export default { fetchTitles, fetchTitleDetails, fetchGenres, fetchImageUrl }
