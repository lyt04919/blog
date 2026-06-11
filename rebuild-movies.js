const fs = require('fs')
const path = require('path')

const booksDir = path.join(__dirname, 'src/app/books')
const moviesDir = path.join(__dirname, 'src/app/movies')

function copyAndReplace(src, dest) {
	if (fs.statSync(src).isDirectory()) {
		if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
		for (const file of fs.readdirSync(src)) {
			copyAndReplace(path.join(src, file), path.join(dest, file.replace('book', 'movie').replace('Book', 'Movie')))
		}
	} else {
		let content = fs.readFileSync(src, 'utf8')
		content = content.replace(/Book/g, 'Movie')
		content = content.replace(/book/g, 'movie')
		content = content.replace(/author/g, 'director')
		content = content.replace(/cover/g, 'poster')
		content = content.replace(/作者/g, '导演')
		content = content.replace(/书籍/g, '电影')
		fs.writeFileSync(dest, content)
	}
}

copyAndReplace(booksDir, moviesDir)
console.log('Movies rebuilt from Books!')
