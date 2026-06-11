import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { BookCard } from './components/book-card'
import { MovieCard } from './components/movie-card'
import { ShareCard } from './share/components/share-card'
import { BloggerCard } from './bloggers/components/blogger-card'
import { FavoriteItemCard, type FavoriteItem } from './components/favorite-item-card'

import booksData from './books.json'
import moviesData from './movies.json'
import shareData from './share/list.json'
import bloggersData from './bloggers/list.json'
import gearsData from './gears.json'
import softwareData from './software.json'
import musicData from './music.json'
import gamesData from './games.json'
import videosData from './videos.json'

import type { Book } from './components/book-card'
import type { Movie } from './components/movie-card'
import type { Share } from './share/components/share-card'
import type { Blogger } from './bloggers/grid-view'

export default function FavoriteDashboard() {
	// Only take the items marked with isShow
	const topBooks = (booksData as Book[]).filter(b => b.isShow)
	const topMovies = (moviesData as Movie[]).filter(m => m.isShow)
	
	// Top items for newly added categories
	const topGears = (gearsData as FavoriteItem[]).filter(g => g.isShow)
	const topSoftware = (softwareData as FavoriteItem[]).filter(s => s.isShow)
	const topMusic = (musicData as FavoriteItem[]).filter(m => m.isShow)
	const topGames = (gamesData as FavoriteItem[]).filter(g => g.isShow)
	const topVideos = (videosData as FavoriteItem[]).filter(v => v.isShow)
	
	// Top 4 shares and bloggers to fit perfectly in a 4-column grid
	const topShares = (shareData as Share[]).filter(s => s.isShow).slice(0, 4)
	const topBloggers = (bloggersData as Blogger[]).filter(b => b.isShow).slice(0, 4)

	return (
		<div className='min-h-screen relative pb-32 bg-bg'>
			<div className='mx-auto w-full max-w-7xl px-6 pt-32 pb-16'>
				<h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 font-serif text-neutral-900 dark:text-white'>
					Favorites
				</h1>
				<p className='text-neutral-500 text-lg'>
					A minimalist collection of my inspirations.
				</p>
			</div>

			<div className='flex flex-col gap-24'>
				{/* Books Section */}
				<section className='mx-auto w-full max-w-7xl px-6'>
					<div className='flex items-end justify-between mb-8'>
						<h2 className='text-2xl font-bold tracking-tight text-neutral-900 dark:text-white uppercase'>
							Books
						</h2>
						<Link 
							href='/favorite/books' 
							className='flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors'
						>
							View All <ArrowRight className='w-4 h-4' />
						</Link>
					</div>
					<div className='flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 sm:gap-6 pb-4 -mx-6 px-6 sm:mx-0 sm:px-0 sm:pb-0'>
						{topBooks.map((book, i) => (
							<div key={`book-${i}`} className='snap-center shrink-0 carousel-item-w'>
								<BookCard book={book} />
							</div>
						))}
					</div>
				</section>

				{/* Movies Section */}
				<section className='mx-auto w-full max-w-7xl px-6'>
					<div className='flex items-end justify-between mb-8'>
						<h2 className='text-2xl font-bold tracking-tight text-neutral-900 dark:text-white uppercase'>
							Movies
						</h2>
						<Link 
							href='/favorite/movies' 
							className='flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors'
						>
							View All <ArrowRight className='w-4 h-4' />
						</Link>
					</div>
					<div className='flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 sm:gap-6 pb-4 -mx-6 px-6 sm:mx-0 sm:px-0 sm:pb-0'>
						{topMovies.map((movie, i) => (
							<div key={`movie-${i}`} className='snap-center shrink-0 carousel-item-w'>
								<MovieCard movie={movie} />
							</div>
						))}
					</div>
				</section>

				{/* Gears Section */}
				<section className='mx-auto w-full max-w-7xl px-6'>
					<div className='flex items-end justify-between mb-8'>
						<h2 className='text-2xl font-bold tracking-tight text-neutral-900 dark:text-white uppercase'>
							Gears
						</h2>
						<Link 
							href='/favorite/gears' 
							className='flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors'
						>
							View All <ArrowRight className='w-4 h-4' />
						</Link>
					</div>
					<div className='flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 sm:gap-6 pb-4 -mx-6 px-6 sm:mx-0 sm:px-0 sm:pb-0'>
						{topGears.map((item, i) => (
							<div key={`gear-${i}`} className='snap-center shrink-0 carousel-item-w'>
								<FavoriteItemCard item={item} targetType="gears" />
							</div>
						))}
					</div>
				</section>

				{/* Software Section */}
				<section className='mx-auto w-full max-w-7xl px-6'>
					<div className='flex items-end justify-between mb-8'>
						<h2 className='text-2xl font-bold tracking-tight text-neutral-900 dark:text-white uppercase'>
							Software
						</h2>
						<Link 
							href='/favorite/software' 
							className='flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors'
						>
							View All <ArrowRight className='w-4 h-4' />
						</Link>
					</div>
					<div className='flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 sm:gap-6 pb-4 -mx-6 px-6 sm:mx-0 sm:px-0 sm:pb-0'>
						{topSoftware.map((item, i) => (
							<div key={`software-${i}`} className='snap-center shrink-0 carousel-item-w'>
								<FavoriteItemCard item={item} targetType="software" />
							</div>
						))}
					</div>
				</section>

				{/* Music & Podcasts Section */}
				<section className='mx-auto w-full max-w-7xl px-6'>
					<div className='flex items-end justify-between mb-8'>
						<h2 className='text-2xl font-bold tracking-tight text-neutral-900 dark:text-white uppercase'>
							Music & Podcasts
						</h2>
						<Link 
							href='/favorite/music' 
							className='flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors'
						>
							View All <ArrowRight className='w-4 h-4' />
						</Link>
					</div>
					<div className='flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 sm:gap-6 pb-4 -mx-6 px-6 sm:mx-0 sm:px-0 sm:pb-0'>
						{topMusic.map((item, i) => (
							<div key={`music-${i}`} className='snap-center shrink-0 carousel-item-w'>
								<FavoriteItemCard item={item} targetType="music" />
							</div>
						))}
					</div>
				</section>

				{/* Games Section */}
				<section className='mx-auto w-full max-w-7xl px-6'>
					<div className='flex items-end justify-between mb-8'>
						<h2 className='text-2xl font-bold tracking-tight text-neutral-900 dark:text-white uppercase'>
							Games
						</h2>
						<Link 
							href='/favorite/games' 
							className='flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors'
						>
							View All <ArrowRight className='w-4 h-4' />
						</Link>
					</div>
					<div className='flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 sm:gap-6 pb-4 -mx-6 px-6 sm:mx-0 sm:px-0 sm:pb-0'>
						{topGames.map((item, i) => (
							<div key={`game-${i}`} className='snap-center shrink-0 carousel-item-w'>
								<FavoriteItemCard item={item} targetType="games" />
							</div>
						))}
					</div>
				</section>

				{/* Videos Section */}
				<section className='mx-auto w-full max-w-7xl px-6'>
					<div className='flex items-end justify-between mb-8'>
						<h2 className='text-2xl font-bold tracking-tight text-neutral-900 dark:text-white uppercase'>
							Videos
						</h2>
						<Link 
							href='/favorite/videos' 
							className='flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors'
						>
							View All <ArrowRight className='w-4 h-4' />
						</Link>
					</div>
					<div className='flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 sm:gap-6 pb-4 -mx-6 px-6 sm:mx-0 sm:px-0 sm:pb-0'>
						{topVideos.map((item, i) => (
							<div key={`video-${i}`} className='snap-center shrink-0 w-[240px] sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-18px)] xl:w-[calc(25%-19.2px)]'>
								<FavoriteItemCard item={item} targetType="videos" />
							</div>
						))}
					</div>
				</section>

				{/* Share Section */}
				<section className='mx-auto w-full max-w-7xl px-6'>
					<div className='flex items-end justify-between mb-8'>
						<h2 className='text-2xl font-bold tracking-tight text-neutral-900 dark:text-white uppercase'>
							Share
						</h2>
						<Link 
							href='/favorite/share' 
							className='flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors'
						>
							View All <ArrowRight className='w-4 h-4' />
						</Link>
					</div>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
						{topShares.map((share, i) => (
							<ShareCard key={`share-${i}`} share={share} />
						))}
					</div>
				</section>

				{/* Bloggers Section */}
				<section className='mx-auto w-full max-w-7xl px-6'>
					<div className='flex items-end justify-between mb-8'>
						<h2 className='text-2xl font-bold tracking-tight text-neutral-900 dark:text-white uppercase'>
							Bloggers
						</h2>
						<Link 
							href='/favorite/bloggers' 
							className='flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors'
						>
							View All <ArrowRight className='w-4 h-4' />
						</Link>
					</div>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
						{topBloggers.map((blogger, i) => (
							<BloggerCard key={`blogger-${i}`} blogger={blogger} />
						))}
					</div>
				</section>
			</div>
		</div>
	)
}
