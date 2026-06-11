'use client'

import { useState } from 'react'

import { type LogoItem } from './components/logo-upload-dialog'
import { MovieCard, type Movie } from './components/movie-card'

interface GridViewProps {
	movies: Movie[]
	isEditMode?: boolean
	onUpdate?: (updatedMovie: Movie, oldMovie: Movie, logoItem?: LogoItem) => void
	onDelete?: (movie: Movie) => void
	onTogglePin?: (movie: Movie) => void
}

export default function GridView({ movies, isEditMode = false, onUpdate, onDelete, onTogglePin }: GridViewProps) {
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedTag, setSelectedTag] = useState<string>('all')

	const allTags = Array.from(new Set(movies.flatMap(movie => movie.tags)))

	const filteredMovies = movies.filter(movie => {
		const matchesSearch = movie.name.toLowerCase().includes(searchTerm.toLowerCase()) || movie.description.toLowerCase().includes(searchTerm.toLowerCase())
		const matchesTag = selectedTag === 'all' || movie.tags.includes(selectedTag)
		return matchesSearch && matchesTag
	})

	return (
		<div className='mx-auto w-full max-w-7xl px-6 pb-12'>
			<div className='mb-8 space-y-4'>
				<input
					type='text'
					placeholder='搜索资源...'
					value={searchTerm}
					onChange={e => setSearchTerm(e.target.value)}
					className='focus:ring-brand mx-auto block w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none'
				/>

				<div className='flex flex-wrap justify-center gap-2'>
					<button
						onClick={() => setSelectedTag('all')}
						className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
							selectedTag === 'all' ? 'bg-brand text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
						}`}>
						全部
					</button>
					{allTags.map((tag: string) => (
						<button
							key={tag}
							onClick={() => setSelectedTag(tag)}
							className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
								selectedTag === tag ? 'bg-brand text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
							}`}>
							{tag}
						</button>
					))}
				</div>
			</div>

			<div className='grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4'>
				{filteredMovies.map((movie: Movie) => (
					<MovieCard key={movie.name} movie={movie} isEditMode={isEditMode} onUpdate={onUpdate} onDelete={() => onDelete?.(movie)} onTogglePin={onTogglePin} />
				))}
			</div>

			{filteredMovies.length === 0 && (
				<div className='mt-12 text-center text-gray-500'>
					<p>没有找到相关资源</p>
				</div>
			)}
		</div>
	)
}
