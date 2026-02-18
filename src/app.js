import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'

import authRoutes from './routes/auth.routes.js'
import pageRoutes from './routes/page.routes.js'
import movieRoutes from './routes/movie.routes.js'
import imageRoutes from './routes/image.routes.js'
import videoRoutes from './routes/video.routes.js'
import { errorHandler } from './middleware/error.middleware.js'

const app = express()

// Middleware
app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(process.cwd(), 'public')))

// Templating
app.set('view engine', 'ejs')
app.set('views', path.join(process.cwd(), 'views'))

// Routes
app.use(authRoutes)
app.use(pageRoutes)
app.use(movieRoutes)
app.use('/images', imageRoutes)
app.use('/videos', videoRoutes)

app.get('/favicon.ico', (req, res) => {
	res.sendFile(path.join(process.cwd(), 'public', 'images', 'MovieVid.png'))
})
app.use((req, res) => {
	res.status(404).render('404', { user: req.user })
})

// Error handling
app.use(errorHandler)

export default app
