'use client'

import { X, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import StarRating from '@/components/star-rating'
import { DialogModal } from '@/components/dialog-modal'
import type { Movie } from './movie-card'

interface MovieDetailModalProps {
	movie: Movie
	onClose: () => void
}

export default function MovieDetailModal({ movie, onClose }: MovieDetailModalProps) {
	const handleResourceClick = (url?: string) => {
		if (url) {
			window.open(url, '_blank', 'noopener,noreferrer')
		} else {
			toast.error('暂无链接')
		}
	}

	return (
		<DialogModal open onClose={onClose} className='card max-w-3xl w-full max-h-[90vh] p-8 md:p-10 relative bg-white flex flex-col shadow-2xl'>
			<div className='absolute top-6 right-6 z-20 bg-white/80 rounded-full'>
				<button onClick={onClose} className='p-2 text-neutral-400 hover:text-neutral-900 transition-colors'>
					<X className='w-5 h-5' />
				</button>
			</div>

			<div className='flex flex-col sm:flex-row gap-8 md:gap-12'>
				{/* Top Left: Poster Image */}
				<div className='shrink-0 w-[140px] sm:w-[200px] mt-2'>
					{movie.poster ? (
						<img
							src={movie.poster}
							alt={movie.name}
							className='w-full aspect-[2/3] object-cover rounded shadow-2xl shadow-black/15 ring-1 ring-black/5'
						/>
					) : (
						<div className='w-full aspect-[2/3] bg-neutral-100 flex items-center justify-center rounded text-neutral-400 text-sm'>
							暂无海报
						</div>
					)}
				</div>

				{/* Right: Details & Resources */}
				<div className='flex-1 flex flex-col min-w-0'>
					{/* Header Info (Fixed) */}
					<div className='shrink-0 mb-6'>
						<div className='flex flex-wrap gap-2 mb-4'>
							{movie.tags.map(tag => (
								<span key={tag} className='px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200 text-[11px] tracking-wide font-medium'>
									{tag}
								</span>
							))}
						</div>

						<h2 className='text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 leading-tight mb-2 tracking-tight'>{movie.name}</h2>
						<p className='text-neutral-500 font-medium text-[15px] mb-4'>导演: {movie.director}</p>
						
						<div className='mb-2'>
							<StarRating stars={movie.stars} />
						</div>
					</div>

					{/* Scrollable Area for Description */}
					<div className='flex-1 overflow-y-auto pr-4 pb-4 custom-scrollbar'>
						<div>
							<h4 className='text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-3'>剧情简介</h4>
							<p className='text-[15px] text-neutral-600 leading-[1.8] whitespace-pre-wrap font-light'>
								{movie.description || '暂无剧情简介'}
							</p>
						</div>
					</div>

					{/* Action Buttons (Fixed at bottom) */}
					<div className='pt-6 mt-auto bg-white flex flex-col sm:flex-row gap-3 shrink-0'>
						<button
							onClick={() => handleResourceClick(movie.doubanUrl)}
							className='flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-neutral-900 text-sm rounded-full font-medium transition-all hover:bg-green-50 hover:text-green-700 hover:border-green-200 border border-neutral-200 shadow-sm active:scale-[0.98]'
						>
							<ExternalLink className='w-4 h-4' />
							<span>前往豆瓣</span>
						</button>
					</div>
				</div>
			</div>
		</DialogModal>
	)
}
