import express from 'express'
import {
	loginPage,
	registerPage,
	sessionLogin,
	logout
} from '../controllers/auth.controller.js'

const router = express.Router()

router.get('/login', loginPage)
router.get('/register', registerPage)
router.post('/sessionLogin', sessionLogin)
router.post('/logout', logout)

export default router
