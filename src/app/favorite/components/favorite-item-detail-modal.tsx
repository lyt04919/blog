'use client'

import { X, ExternalLink, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import StarRating from '@/components/star-rating'
import { DialogModal } from '@/components/dialog-modal'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { useAuthStore } from '@/hooks/use-auth'

interface FavoriteItem {
	name: string
	cover: string
	subtitle?: string
	desc: string
	review?: string
	link?: string
	isPinned?: boolean
	isShow?: boolean
	stars?: number
	status?: string
	embedCode?: string
	category?: string
}

interface FavoriteItemDetailModalProps {
	item: FavoriteItem
	targetType: 'gears' | 'software' | 'music' | 'games' | 'videos'
	onClose: () => void
	onEdit?: () => void
}

export function FavoriteItemDetailModal({ item, targetType, onClose, onEdit }: FavoriteItemDetailModalProps) {
	const { isAuth } = useAuthStore()
	const { siteContent } = useConfigStore()
	const hideEditButton = siteContent.hideEditButton ?? false

	const handleResourceClick = (url?: string) => {
		if (url) {
			window.open(url, '_blank', 'noopener,noreferrer')
		} else {
			toast.error('暂无链接')
		}
	}

	const subtitleLabel = {
		gears: '品牌 / 厂商',
		software: '开发者 / 团队',
		music: '艺术家 / 栏目',
		games: '平台',
		videos: '作者 / Up主'
	}[targetType]

	const sectionTitle = {
		gears: '关于此装备',
		software: '关于此软件',
		music: '关于此音乐',
		games: '关于此游戏',
		videos: '关于此视频'
	}[targetType]

	const linkLabel = {
		gears: '官方链接',
		software: '官方链接',
		music: '前往收听',
		games: '前往商店',
		videos: '前往观看'
	}[targetType]

	const hasRating = targetType === 'games' && typeof item.stars === 'number'

	const coverAspect = targetType === 'videos'
		? 'aspect-video'
		: targetType === 'games'
			? 'aspect-[2/3]'
			: 'aspect-square'

	return (
		<DialogModal open onClose={onClose} className='card max-w-3xl w-full max-h-[90vh] p-8 md:p-10 relative bg-white flex flex-col shadow-2xl'>
			{/* Top Right Buttons: Edit + Close */}
			<div className='absolute top-6 right-6 z-20 flex items-center gap-2'>
				{(!hideEditButton || isAuth) && onEdit && (
					<button
						onClick={() => {
							onClose()
							onEdit()
						}}
						className='p-2 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition-colors'
						title='编辑'
					>
						<Pencil className='w-4 h-4' />
					</button>
				)}
				<button onClick={onClose} className='p-2 rounded-full bg-white/80 text-neutral-400 hover:text-neutral-900 transition-colors'>
					<X className='w-5 h-5' />
				</button>
			</div>

			<div className='flex flex-col sm:flex-row gap-8 md:gap-12'>
				{/* Left Side: Cover Image */}
				<div className='shrink-0 w-[140px] sm:w-[200px] mt-2'>
					{item.cover ? (
						<img
							src={item.cover}
							alt={item.name}
							className={`w-full ${coverAspect} object-cover rounded shadow-2xl shadow-black/15 ring-1 ring-black/5`}
							referrerPolicy='no-referrer'
						/>
					) : (
						<div className={`w-full ${coverAspect} bg-neutral-100 flex items-center justify-center rounded text-neutral-400 text-sm`}>
							暂无图片
						</div>
					)}
				</div>

				{/* Right Side: Details & Resources */}
				<div className='flex-1 flex flex-col min-w-0'>
					{/* Header Info */}
					<div className='shrink-0 mb-6'>
						<div className='flex flex-wrap gap-2 mb-4'>
							{item.category && (
								<span className='px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200 text-[11px] tracking-wide font-medium'>
									{item.category}
								</span>
							)}
							{item.status && (
								<span className='px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[11px] tracking-wide font-medium'>
									{item.status}
								</span>
							)}
						</div>

						<h2 className='text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 leading-tight mb-2 tracking-tight'>{item.name}</h2>

						{item.subtitle && (
							<p className='text-neutral-500 font-medium text-[15px] mb-4'>
								{subtitleLabel}: {item.subtitle}
							</p>
						)}

						{hasRating && (
							<div className='mb-2'>
								<StarRating stars={item.stars || 5} />
							</div>
						)}
					</div>

					{/* Scrollable Area */}
					<div className='flex-1 overflow-y-auto pr-4 pb-4 custom-scrollbar'>
						{item.review && (
							<div className='mb-8 pl-4 border-l-2 border-neutral-800 py-1'>
								<p className='text-[15px] text-neutral-600 leading-relaxed italic'>
									&quot;{item.review}&quot;
								</p>
							</div>
						)}

						<div>
							<h4 className='text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-3'>{sectionTitle}</h4>
							<p className='text-[15px] text-neutral-600 leading-[1.8] whitespace-pre-wrap font-light'>
								{item.desc || '暂无简介'}
							</p>
						</div>

						{targetType === 'music' && item.embedCode && (
							<div
								className='mt-6 w-full overflow-hidden rounded-xl'
								dangerouslySetInnerHTML={{ __html: item.embedCode }}
							/>
						)}
					</div>

					{/* Action Buttons */}
					{item.link && (
						<div className='pt-6 mt-auto bg-white flex flex-col sm:flex-row gap-3 shrink-0'>
							<button
								onClick={() => handleResourceClick(item.link)}
								className='flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 text-white text-sm rounded-full font-medium transition-all hover:bg-neutral-800 hover:shadow-lg active:scale-[0.98]'
							>
								<ExternalLink className='w-4 h-4' />
								<span>{linkLabel}</span>
							</button>
						</div>
					)}
				</div>
			</div>
		</DialogModal>
	)
}
