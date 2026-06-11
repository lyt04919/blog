'use client'

import { X, ExternalLink } from 'lucide-react'
import StarRating from '@/components/star-rating'
import { DialogModal } from '@/components/dialog-modal'
import type { Share } from './share-card'

interface ShareDetailModalProps {
	share: Share
	onClose: () => void
}

export default function ShareDetailModal({ share, onClose }: ShareDetailModalProps) {
	const handleVisit = () => {
		if (share.url) {
			window.open(share.url, '_blank', 'noopener,noreferrer')
		}
	}

	return (
		<DialogModal open onClose={onClose} className='card max-w-lg w-full p-8 md:p-12 relative bg-white flex flex-col shadow-2xl items-center text-center overflow-hidden'>
			<div className='absolute top-6 right-6 z-20 bg-white/80 rounded-full'>
				<button onClick={onClose} className='p-2 text-neutral-400 hover:text-neutral-900 transition-colors'>
					<X className='w-5 h-5' />
				</button>
			</div>

			{/* Logo / Icon */}
			<div className='w-28 h-28 sm:w-32 sm:h-32 mb-8 relative'>
				<img
					src={share.logo}
					alt={share.name}
					className='w-full h-full object-cover rounded-2xl shadow-xl shadow-black/10 ring-1 ring-black/5'
				/>
			</div>

			{/* Title & Stars */}
			<h2 className='text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight mb-4'>
				{share.name}
			</h2>
			<div className='mb-6'>
				<StarRating stars={share.stars} />
			</div>

			{/* Tags */}
			<div className='flex flex-wrap justify-center gap-2 mb-8'>
				{share.tags.map(tag => (
					<span key={tag} className='px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200 text-xs tracking-wide font-medium'>
						{tag}
					</span>
				))}
			</div>

			{/* Description */}
			{share.description && (
				<p className='text-[15px] text-neutral-600 leading-relaxed font-light mb-10 w-full max-w-sm mx-auto'>
					{share.description}
				</p>
			)}

			{/* Action Button */}
			<button
				onClick={handleVisit}
				className='w-full max-w-sm flex items-center justify-center gap-2 px-6 py-4 bg-neutral-900 text-white text-base rounded-full font-medium transition-all hover:bg-neutral-800 hover:shadow-lg active:scale-[0.98]'
			>
				<ExternalLink className='w-5 h-5' />
				<span>立即访问该网站</span>
			</button>
		</DialogModal>
	)
}
