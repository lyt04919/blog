'use client'

import { motion } from 'motion/react'
import { useState } from 'react'
import BookDetailModal from './book-detail-modal'
import MovieDetailModal from './movie-detail-modal'
import type { Book } from './book-card'
import type { Movie } from './movie-card'

interface SimpleCardProps {
	type: 'book' | 'movie'
	item: Book | Movie
}

export function SimpleCard({ type, item }: SimpleCardProps) {
	const [isDetailOpen, setIsDetailOpen] = useState(false)

	const cover = type === 'book' ? (item as Book).cover : (item as Movie).poster
	const name = item.name

	return (
		<>
			<motion.div
				whileHover={{ scale: 1.05, y: -5 }}
				whileTap={{ scale: 0.95 }}
				className='relative block w-full aspect-[3/4] overflow-hidden rounded-xl shadow-sm hover:shadow-xl transition-all cursor-pointer bg-neutral-100 ring-1 ring-black/5 shrink-0'
				onClick={() => setIsDetailOpen(true)}
			>
				{cover ? (
					<img src={cover} alt={name} className='w-full h-full object-cover' />
				) : (
					<div className='w-full h-full flex flex-col items-center justify-center p-4 text-center'>
						<span className='text-xs text-neutral-400 font-medium line-clamp-3'>{name}</span>
					</div>
				)}
				{/* Very subtle gradient overlay at the bottom just to make it look premium */}
				<div className='absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none' />
			</motion.div>

			{isDetailOpen && type === 'book' && <BookDetailModal book={item as Book} onClose={() => setIsDetailOpen(false)} />}
			{isDetailOpen && type === 'movie' && <MovieDetailModal movie={item as Movie} onClose={() => setIsDetailOpen(false)} />}
		</>
	)
}
