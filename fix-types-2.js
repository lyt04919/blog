const fs = require('fs')
const path = require('path')

// fix books/components/book-card.tsx
let bookCard = fs.readFileSync(path.join(__dirname, 'src/app/books/components/book-card.tsx'), 'utf8')
bookCard = bookCard.replace(/useState\(books\)/g, 'useState(book)')
bookCard = bookCard.replace(/updated, books,/g, 'updated, book,')
bookCard = bookCard.replace(/localBook\.tags\.map\(tag =>/g, 'localBook.tags.map((tag: string) =>')
fs.writeFileSync(path.join(__dirname, 'src/app/books/components/book-card.tsx'), bookCard)

// fix books/grid-view.tsx
let booksGridView = fs.readFileSync(path.join(__dirname, 'src/app/books/grid-view.tsx'), 'utf8')
booksGridView = booksGridView.replace(/bookss: Book\[\]/g, 'books: Book[]')
booksGridView = booksGridView.replace(/bookss\.filter/g, 'books.filter')
booksGridView = booksGridView.replace(/books=\{books\}/g, 'books={books}') // Wait, grid-view uses books={books} instead of book={book}
// Ah wait! I changed the prop name to `book` in BookCard, so grid-view needs to pass `book={book}` not `books={books}`!
// Actually grid view line 61: <BookCard key={book.author} book={book} ... /> 
// But grid-view props still says `bookss: Book[]`.
fs.writeFileSync(path.join(__dirname, 'src/app/books/grid-view.tsx'), booksGridView)


// fix movies/components/movie-card.tsx
let movieCard = fs.readFileSync(path.join(__dirname, 'src/app/movies/components/movie-card.tsx'), 'utf8')
movieCard = movieCard.replace(/useState\(movies\)/g, 'useState(movie)')
movieCard = movieCard.replace(/updated, movies,/g, 'updated, movie,')
movieCard = movieCard.replace(/localMovie\.tags\.map\(tag =>/g, 'localMovie.tags.map((tag: string) =>')
fs.writeFileSync(path.join(__dirname, 'src/app/movies/components/movie-card.tsx'), movieCard)

// fix movies/grid-view.tsx
let moviesGridView = fs.readFileSync(path.join(__dirname, 'src/app/movies/grid-view.tsx'), 'utf8')
moviesGridView = moviesGridView.replace(/moviess: Movie\[\]/g, 'movies: Movie[]')
moviesGridView = moviesGridView.replace(/moviess\.filter/g, 'movies.filter')
fs.writeFileSync(path.join(__dirname, 'src/app/movies/grid-view.tsx'), moviesGridView)

