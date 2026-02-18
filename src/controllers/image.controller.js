import imageService from '../services/image.service.js'

export async function resizeImage(req, res, next) {
	try {
		const { url, width, height } = req.query
		const cachePath = await imageService.getCachedImagePath(
			url,
			width,
			height
		)
		res.sendFile(cachePath)
	} catch (err) {
		next(err)
	}
}
