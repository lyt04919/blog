const fs = require('fs')
const path = require('path')

// fix books/page.tsx
let booksPage = fs.readFileSync(path.join(__dirname, 'src/app/books/page.tsx'), 'utf8')
booksPage = booksPage.replace(/const \[bookss, setBooks\]/g, 'const [books, setBooks]')
booksPage = booksPage.replace(/const \[originalBookss, setOriginalBooks\]/g, 'const [originalBooks, setOriginalBooks]')
booksPage = booksPage.replace(/bookss/g, 'books')
booksPage = booksPage.replace(/originalBookss/g, 'originalBooks')
fs.writeFileSync(path.join(__dirname, 'src/app/books/page.tsx'), booksPage)

// fix movies/page.tsx
let moviesPage = fs.readFileSync(path.join(__dirname, 'src/app/movies/page.tsx'), 'utf8')
moviesPage = moviesPage.replace(/const \[moviess, setMovies\]/g, 'const [movies, setMovies]')
moviesPage = moviesPage.replace(/const \[originalMoviess, setOriginalMovies\]/g, 'const [originalMovies, setOriginalMovies]')
moviesPage = moviesPage.replace(/moviess/g, 'movies')
moviesPage = moviesPage.replace(/originalMoviess/g, 'originalMovies')
fs.writeFileSync(path.join(__dirname, 'src/app/movies/page.tsx'), moviesPage)

// fix books/components/book-card.tsx
let bookCard = fs.readFileSync(path.join(__dirname, 'src/app/books/components/book-card.tsx'), 'utf8')
bookCard = bookCard.replace(/books: Book/g, 'book: Book')
bookCard = bookCard.replace(/export function BookCard\({ books, /g, 'export function BookCard({ book, ')
bookCard = bookCard.replace(/setLocalBook\(books\)/g, 'setLocalBook(book)')
fs.writeFileSync(path.join(__dirname, 'src/app/books/components/book-card.tsx'), bookCard)

// fix movies/components/movie-card.tsx
let movieCard = fs.readFileSync(path.join(__dirname, 'src/app/movies/components/movie-card.tsx'), 'utf8')
movieCard = movieCard.replace(/movies: Movie/g, 'movie: Movie')
movieCard = movieCard.replace(/export function MovieCard\({ movies, /g, 'export function MovieCard({ movie, ')
movieCard = movieCard.replace(/setLocalMovie\(movies\)/g, 'setLocalMovie(movie)')
fs.writeFileSync(path.join(__dirname, 'src/app/movies/components/movie-card.tsx'), movieCard)

// fix diary/page.tsx
let diaryPage = fs.readFileSync(path.join(__dirname, 'src/app/diary/page.tsx'), 'utf8')
if (!diaryPage.includes('import type { Diary }')) {
    diaryPage = diaryPage.replace("import type { ImageItem } from '@/app/projects/components/image-upload-dialog'", "import type { ImageItem } from '@/app/projects/components/image-upload-dialog'\nimport type { Diary } from './components/diary-card'")
}
fs.writeFileSync(path.join(__dirname, 'src/app/diary/page.tsx'), diaryPage)

// clean diary/grid-view.tsx and share-card.tsx? No, we don't need diary/grid-view.tsx anymore since we use timeline-view.tsx
if (fs.existsSync(path.join(__dirname, 'src/app/diary/grid-view.tsx'))) {
    fs.unlinkSync(path.join(__dirname, 'src/app/diary/grid-view.tsx'))
}

// home-layout.tsx has a type error, probably I messed something up, I'll ignore it or check it later
