const z = require('zod')

const movieSchema = z.object({
	title: z.string({
		invalid_type_error: 'Movie title must be a string',
		required_error: 'Movie title is required',
	}),
	year: z.number().int().min(1888).max(2024),
	director: z.string(),
	duration: z.number().int().positive(),
	rate: z.number().min(0).max(10).default(0),
	poster: z.string().url({
		message: 'Movie poster must be a valid URL',
	}),
	genre: z.array(
		z.enum(['Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 'Drama', 'Family', 'Fantasy', 'Film Noir', 'History', 'Horror', 'Music', 'Musical', 'Mystery', 'Romance', 'Sci-Fi', 'Short Film', 'Sport', 'Superhero', 'Thriller', 'War', 'Western']),
		{
			required_error: 'Movie genre is required',
			invalid_type_error: 'Movie genre must be an array of strings',
		}
	)
})

function validateMovie (object) {
	return movieSchema.safeParse(object)
}

function validatePartialMovie (object) {
	return movieSchema.partial().safeParse(object)
}

module.exports = {
	validateMovie, 
	validatePartialMovie
}