import imdbService from '../services/imdb.service.js'

export async function renderHome(req, res, next) {
	try {
		const titles = await imdbService.fetchTitles()
		const filteredTitles = titles.filter(
			(t) => t.type == 'movie' || t.type == 'tvSeries'
		)
		res.render('index', { titles: filteredTitles, user: req.user })
	} catch (err) {
		next(err)
	}
}

export async function renderMovies(req, res, next) {
	try {
		const movies = await imdbService.fetchTitles('MOVIE')
		res.render('movies', { movies, user: req.user })
	} catch (err) {
		next(err)
	}
}

export async function renderSeries(req, res, next) {
	try {
		const series = await imdbService.fetchTitles('TV_SERIES')
		res.render('series', { series, user: req.user })
	} catch (err) {
		next(err)
	}
}

export async function renderGenres(req, res, next) {
	try {
		const genres = await imdbService.fetchGenres()
		res.render('genres', { genres, user: req.user })
	} catch (err) {
		next(err)
	}
}
