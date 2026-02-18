import { admin } from '../firebaseAdmin.js'

export async function checkAuth(req, res, next) {
	try {
		const sessionCookie = req.cookies.session || ''
		const decodedClaims = await admin
			.auth()
			.verifySessionCookie(sessionCookie, true)
		req.user = decodedClaims
		next()
	} catch {
		res.redirect('/login')
	}
}
