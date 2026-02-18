import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CACHE_DIR = path.join(__dirname, '..', '..', 'cache')
const DATA_CACHE_DIR = path.join(CACHE_DIR, 'data')

if (!fs.existsSync(DATA_CACHE_DIR)) {
	fs.mkdirSync(DATA_CACHE_DIR, { recursive: true })
}

// In-memory cache for faster access
const memoryCache = new Map()

// Default TTL: 1 hour for API data
const DEFAULT_TTL = 60 * 60 * 1000

/**
 * Get cached data by key
 * @param {string} key - Cache key
 * @param {number} ttl - Time to live in milliseconds
 * @returns {any|null} Cached data or null if expired/missing
 */
export function get(key, ttl = DEFAULT_TTL) {
	// Check memory cache first
	if (memoryCache.has(key)) {
		const { data, timestamp } = memoryCache.get(key)
		if (Date.now() - timestamp < ttl) {
			return data
		}
		memoryCache.delete(key)
	}

	// Check disk cache
	const cacheFile = getCacheFilePath(key)
	if (fs.existsSync(cacheFile)) {
		try {
			const fileContent = fs.readFileSync(cacheFile, 'utf-8')
			const { data, timestamp } = JSON.parse(fileContent)

			if (Date.now() - timestamp < ttl) {
				// Restore to memory cache
				memoryCache.set(key, { data, timestamp })
				return data
			}
			// Expired, delete file
			fs.unlinkSync(cacheFile)
		} catch (err) {
			console.error('Cache read error:', err)
		}
	}

	return null
}

/**
 * Set cached data
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 */
export function set(key, data) {
	const timestamp = Date.now()
	const cacheData = { data, timestamp }

	// Store in memory
	memoryCache.set(key, cacheData)

	// Store on disk
	try {
		const cacheFile = getCacheFilePath(key)
		fs.writeFileSync(cacheFile, JSON.stringify(cacheData))
	} catch (err) {
		console.error('Cache write error:', err)
	}
}

/**
 * Clear all cache
 */
export function clear() {
	memoryCache.clear()

	try {
		const files = fs.readdirSync(DATA_CACHE_DIR)
		files.forEach((file) => {
			fs.unlinkSync(path.join(DATA_CACHE_DIR, file))
		})
	} catch (err) {
		console.error('Cache clear error:', err)
	}
}

/**
 * Get cache file path for a key
 */
function getCacheFilePath(key) {
	const hash = crypto.createHash('md5').update(key).digest('hex')
	return path.join(DATA_CACHE_DIR, `${hash}.json`)
}

export default { get, set, clear }
