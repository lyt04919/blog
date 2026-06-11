const fs = require('fs')
const path = require('path')

function replaceInDir(dir, replacements) {
	const entries = fs.readdirSync(dir, { withFileTypes: true })
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name)
		if (entry.isDirectory()) {
			replaceInDir(fullPath, replacements)
		} else if (entry.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
			let content = fs.readFileSync(fullPath, 'utf8')
			let changed = false
			for (const { from, to } of replacements) {
				if (content.includes(from)) {
					content = content.replace(new RegExp(from, 'g'), to)
					changed = true
				}
			}
			if (changed) {
				fs.writeFileSync(fullPath, content)
			}
		}
	}
}

replaceInDir(path.join(__dirname, 'src/app/books'), [
	{ from: 'books-card', to: 'book-card' },
	{ from: 'push-bookss', to: 'push-books' },
	{ from: 'pushBookss', to: 'pushBooks' },
	{ from: 'Bookss', to: 'Books' },
	{ from: 'books: Book\\[\\]', to: 'books: Book[]' }
])

replaceInDir(path.join(__dirname, 'src/app/movies'), [
	{ from: 'movies-card', to: 'movie-card' },
	{ from: 'push-moviess', to: 'push-movies' },
	{ from: 'pushMoviess', to: 'pushMovies' },
	{ from: 'Moviess', to: 'Movies' },
	{ from: 'movies: Movie\\[\\]', to: 'movies: Movie[]' }
])

replaceInDir(path.join(__dirname, 'src/app/diary'), [
	{ from: 'diarys-card', to: 'diary-card' },
	{ from: 'diary-card', to: 'diary-card' },
	{ from: 'push-diarys', to: 'push-diary' },
	{ from: 'pushDiarys', to: 'pushDiary' },
	{ from: 'Diarys', to: 'Diaries' },
	{ from: 'diarys', to: 'diaries' }
])
console.log('Cleanup script finished.')
