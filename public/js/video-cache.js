// Client-side video cache using Cache API and IndexedDB
const VIDEO_CACHE_NAME = 'movievid-video-cache-v1'
const PLAYLIST_CACHE_NAME = 'movievid-playlist-cache-v1'
const MAX_CACHE_SIZE_MB = 500 // Maximum cache size in MB

class VideoCache {
	constructor() {
		this.db = null
		this.ready = this.init()
	}

	async init() {
		try {
			// Initialize Cache API
			await caches.open(VIDEO_CACHE_NAME)
			await caches.open(PLAYLIST_CACHE_NAME)

			// Initialize IndexedDB for metadata
			this.db = await this.openDB()
			console.log('Video cache initialized')
			return true
		} catch (err) {
			console.warn('Video cache unavailable:', err)
			return false
		}
	}

	openDB() {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open('MovieVidCache', 1)

			request.onerror = () => reject(request.error)
			request.onsuccess = () => resolve(request.result)

			request.onupgradeneeded = (event) => {
				const db = event.target.result
				if (!db.objectStoreNames.contains('metadata')) {
					const store = db.createObjectStore('metadata', {
						keyPath: 'url'
					})
					store.createIndex('timestamp', 'timestamp', {
						unique: false
					})
					store.createIndex('size', 'size', { unique: false })
				}
			}
		})
	}

	async getCacheSize() {
		if (!navigator.storage || !navigator.storage.estimate) return 0
		try {
			const estimate = await navigator.storage.estimate()
			return estimate.usage || 0
		} catch (err) {
			return 0
		}
	}

	async addMetadata(url, size) {
		if (!this.db) return
		try {
			const tx = this.db.transaction(['metadata'], 'readwrite')
			const store = tx.objectStore('metadata')
			await store.put({
				url,
				size,
				timestamp: Date.now()
			})
		} catch (err) {
			console.warn('Failed to add metadata:', err)
		}
	}

	async getMetadata(url) {
		if (!this.db) return null
		try {
			const tx = this.db.transaction(['metadata'], 'readonly')
			const store = tx.objectStore('metadata')
			return await new Promise((resolve, reject) => {
				const request = store.get(url)
				request.onsuccess = () => resolve(request.result)
				request.onerror = () => reject(request.error)
			})
		} catch (err) {
			return null
		}
	}

	async evictOldest() {
		if (!this.db) return
		try {
			const tx = this.db.transaction(['metadata'], 'readwrite')
			const store = tx.objectStore('metadata')
			const index = store.index('timestamp')

			const allEntries = await new Promise((resolve, reject) => {
				const request = index.openCursor()
				const entries = []
				request.onsuccess = (event) => {
					const cursor = event.target.result
					if (cursor) {
						entries.push(cursor.value)
						cursor.continue()
					} else {
						resolve(entries)
					}
				}
				request.onerror = () => reject(request.error)
			})

			// Remove oldest 20% of entries
			const toRemove = Math.ceil(allEntries.length * 0.2)
			const videoCache = await caches.open(VIDEO_CACHE_NAME)
			const playlistCache = await caches.open(PLAYLIST_CACHE_NAME)

			for (let i = 0; i < toRemove && i < allEntries.length; i++) {
				const entry = allEntries[i]
				await videoCache.delete(entry.url)
				await playlistCache.delete(entry.url)
				await store.delete(entry.url)
			}

			console.log(`Evicted ${toRemove} old cache entries`)
		} catch (err) {
			console.warn('Failed to evict cache:', err)
		}
	}

	async shouldCache() {
		const size = await this.getCacheSize()
		const maxBytes = MAX_CACHE_SIZE_MB * 1024 * 1024
		if (size > maxBytes) {
			await this.evictOldest()
		}
		return true
	}

	async fetch(url, isPlaylist = false) {
		await this.ready

		const cacheName = isPlaylist ? PLAYLIST_CACHE_NAME : VIDEO_CACHE_NAME

		try {
			// Try cache first
			const cache = await caches.open(cacheName)
			let response = await cache.match(url)

			if (response) {
				console.log('Cache hit:', url)
				return response.clone()
			}

			// Fetch from network
			console.log('Cache miss, fetching:', url)
			response = await fetch(url)

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`)
			}

			// Cache response if possible
			if (await this.shouldCache()) {
				const responseClone = response.clone()
				await cache.put(url, responseClone)

				// Track size for segments
				if (!isPlaylist) {
					const blob = await responseClone.blob()
					await this.addMetadata(url, blob.size)
				}
			}

			return response
		} catch (err) {
			console.error('Cache fetch failed:', err)
			// Fallback to direct fetch
			return fetch(url)
		}
	}

	async clear() {
		try {
			await caches.delete(VIDEO_CACHE_NAME)
			await caches.delete(PLAYLIST_CACHE_NAME)
			if (this.db) {
				const tx = this.db.transaction(['metadata'], 'readwrite')
				const store = tx.objectStore('metadata')
				await store.clear()
			}
			console.log('Cache cleared')
		} catch (err) {
			console.error('Failed to clear cache:', err)
		}
	}

	async getStats() {
		try {
			const size = await this.getCacheSize()
			const videoCache = await caches.open(VIDEO_CACHE_NAME)
			const videoKeys = await videoCache.keys()
			const playlistCache = await caches.open(PLAYLIST_CACHE_NAME)
			const playlistKeys = await playlistCache.keys()

			return {
				totalSize: size,
				videoSegments: videoKeys.length,
				playlists: playlistKeys.length,
				maxSize: MAX_CACHE_SIZE_MB * 1024 * 1024
			}
		} catch (err) {
			return null
		}
	}
}

// Export singleton instance
window.videoCache = new VideoCache()
