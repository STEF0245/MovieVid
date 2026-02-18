import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import sharp from 'sharp'
import fetch from 'node-fetch'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CACHE_DIR = path.join(__dirname, '..', '..', 'cache', 'images')
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true })

export async function getCachedImagePath(url, width = 160, height = 240) {
	if (!url) return null

	const hash = crypto
		.createHash('md5')
		.update(url + width + height)
		.digest('hex')
	const cacheFile = path.join(CACHE_DIR, `${hash}.webp`)

	// If not cached, fetch and resize
	if (!fs.existsSync(cacheFile)) {
		const response = await fetch(url)
		if (!response.ok) throw new Error('Failed to fetch image')
		const buffer = await response.arrayBuffer()
		await sharp(buffer)
			.resize(parseInt(width), parseInt(height))
			.webp({ quality: 5 })
			.toFile(cacheFile)
	}

	return cacheFile
}

export default { getCachedImagePath }
