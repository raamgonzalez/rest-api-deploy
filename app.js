const express = require('express')
const movies = require('./movies.json')
const crypto = require('crypto')
// const cors = require('cors')
const {validateMovie, validatePartialMovie} = require('./schemas/movies')


const app = express()
app.use(express.json()) // parsea el body de las peticiones a json
// app.use(cors({
// 	origin: (origin, callback) => {
// 		const ACCEPTED_ORIGINS = [
// 			'http://localhost:3000',
// 			'http://localhost:1234',
// 			'http://localhost:4321',
// 			'http://localhost:5000',
// 			'http://localhost:8080',
// 			'https://movies.com'
// 		]
		
// 		if(ACCEPTED_ORIGINS.includes(origin)) {
// 			return callback(null, true)
// 		}
// 		if(!origin) {
// 			return callback(null, true)
// 		}
		
// 		return callback(new Error('Not allowed by CORS'))
// 	}}
// )) // habilita cors para todas las rutas
app.disable('x-powered-by') // disable x-powered-by header
	const ACCEPTED_ORIGINS = [
		'http://localhost:3000',
		'http://localhost:1234',
		'http://localhost:4321',
		'http://localhost:5000',
		'http://localhost:8080',
		'https://movies.com'
	]

//Todos los recursos que sean movies se identifican con /movies
app.get('/movies', (req, res) => {
	const origin = req.header('origin')
	if(ACCEPTED_ORIGINS.includes(origin) || !origin) {
		res.header('Access-Control-Allow-Origin', origin)
	}

	const { genre } = req.query
	if (genre) {
		const filteredMovies = movies.filter(
			movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
		)
		return res.json(filteredMovies)
	}
	res.json(movies)
})

app.get('/movies/:id', (req, res) => { //path-to-regexp
	const { id } = req.params
	const movie = movies.find(movie => movie.id === id)
	if (movie) return res.json(movie)

	res.status(404).json({ message: 'Movie not found' })
})

app.post('/movies', (req, res) => {
	const result = validateMovie(req.body)

	if (result.error) {
		return res.status(400).json({error: JSON.parse(result.error.message)})
	}

	const newMovie = {
		id: crypto.randomUUID(), // uuid v4 
		...result.data
	}

	// Esto no sería REST, porque estamos guardando el estado de la aplicación en memoria.
	movies.push(newMovie)

	res.status(201).json(newMovie)
})

app.delete('/movies/:id', (req, res) => {
	const origin = req.header('origin')
	if(ACCEPTED_ORIGINS.includes(origin) || !origin) {
		res.header('Access-Control-Allow-Origin', origin)
	}
	
	const { id } = req.params
	const movieIndex = movies.findIndex(movie => movie.id === id)

	if(movieIndex === -1) {
		return res.status(204).json({ message: 'Movie not found' })
	}

	movies.splice(movieIndex, 1)

	return res.json({ message: 'Movie deleted' })
})

app.patch('/movies/:id', (req, res) => {
	const result = validatePartialMovie(req.body)

	if(!result.success) {
		return res.status(400).json({ error: JSON.parse(result.error.message) })
	}

	const { id } = req.params
	const movieIndex = movies.findIndex(movie => movie.id === id)

	if(movieIndex === -1) {
		return res.status(404).json({ message: 'Movie not found' })
	}
	
	const updateMovie = {
		...movies[movieIndex],
		...result.data
	}

	movies[movieIndex] = updateMovie

	return res.json(updateMovie)
})

app.options('/movies:id', (req, res) => {
	const origin = req.header('origin')
	if(ACCEPTED_ORIGINS.includes(origin) || !origin) {
		res.header('Access-Control-Allow-Origin', origin)
		res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
	}
	res.send(200)
})


const PORT = process.env.PORT || 1234

app.listen(PORT, () => {
	console.log(`Server is listening on port http://localhost:${PORT}`)
})

