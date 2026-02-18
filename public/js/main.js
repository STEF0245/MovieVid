// Firebase config
const firebaseConfig = {
	apiKey: 'AIzaSyC0I5TBh6rpXvkJede8bCsGrI_49ynqlxI',
	authDomain: 'movievid-stef0245.firebaseapp.com',
	projectId: 'movievid-stef0245'
}

firebase.initializeApp(firebaseConfig)
const auth = firebase.auth()

// Login
const loginBtn = document.getElementById('loginBtn')
if (loginBtn) {
	loginBtn.addEventListener('click', async () => {
		try {
			const userCredential = await auth.signInWithPopup(
				new firebase.auth.GoogleAuthProvider()
			)
			const idToken = await userCredential.user.getIdToken()
			await fetch('/sessionLogin', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ idToken })
			})
			window.location.href = '/'
		} catch (err) {
			alert(err.message)
		}
	})
}

// Register
const registerBtn = document.getElementById('registerBtn')
if (registerBtn) {
	registerBtn.addEventListener('click', async () => {
		try {
			const userCredential = await auth.signInWithPopup(
				new firebase.auth.GoogleAuthProvider()
			)
			const idToken = await userCredential.user.getIdToken()
			await fetch('/sessionLogin', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ idToken })
			})
			window.location.href = '/'
		} catch (err) {
			alert(err.message)
		}
	})
}
