'use client'

import { motion } from 'motion/react'
import { useState, useEffect } from 'react'
import { Pin, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import StarRating from '@/components/star-rating'
import { useSize } from '@/hooks/use-size'
import { FavoriteItemDetailModal } from './favorite-item-detail-modal'
import { FavoriteItemEditModal } from './favorite-item-edit-modal'
import LogoUploadDialog, { type LogoItem } from './logo-upload-dialog'

export interface FavoriteItem {
	name: string
	cover: string
	subtitle?: string // author, director, brand, publisher
	desc: string
	review?: string
	link?: string
	isPinned?: boolean
	isShow?: boolean
	stars?: number // rating for games
	status?: string // status for games (e.g. 已通关, 正在玩)
	embedCode?: string // iframe embed code for music
	category?: string
}

interface FavoriteItemCardProps {
	item: FavoriteItem
	targetType: 'gears' | 'software' | 'music' | 'games' | 'videos'
	isEditMode?: boolean
	onUpdate?: (updatedItem: FavoriteItem, oldItem: FavoriteItem, logoItem?: LogoItem) => void
	onDelete?: () => void
	onTogglePin?: (item: FavoriteItem) => void
}

export function FavoriteItemCard({
	item,
	targetType,
	isEditMode = false,
	onUpdate,
	onDelete,
	onTogglePin
}: FavoriteItemCardProps) {
	const { maxSM } = useSize()
	const [localItem, setLocalItem] = useState(item)
	const [isDetailOpen, setIsDetailOpen] = useState(false)
	const [isEditing, setIsEditing] = useState(false)
	const [logoItem, setLogoItem] = useState<LogoItem | null>(null)

	useEffect(() => {
		setLocalItem(item)
	}, [item])

	const handleSave = (updatedItem: FavoriteItem) => {
		onUpdate?.(updatedItem, item)
		setIsEditing(false)
	}

	const handleCardClick = () => {
		if (isEditMode) {
			setIsEditing(true)
		} else {
			setIsDetailOpen(true)
		}
	}

	const aspectClass = cn(
		targetType === 'videos' && 'aspect-[16/9]',
		targetType === 'games' && 'aspect-[2/3]',
		(targetType === 'gears' || targetType === 'software' || targetType === 'music') && 'aspect-square'
	)

	return (
		<>
			<motion.div
				initial={{ opacity: 0, scale: 0.6 }}
				{...(maxSM ? { animate: { opacity: 1, scale: 1 } } : { whileInView: { opacity: 1, scale: 1 } })}
				className={cn(
					'relative block overflow-hidden group w-full bg-white/30 backdrop-blur-sm border border-white/60 rounded-3xl hover:border-slate-700/80 hover:bg-slate-800/95 transition-all duration-500 shadow-sm shrink-0',
					aspectClass
				)}
				style={targetType === 'videos' ? { aspectRatio: '16 / 9' } : undefined}
			>
				{/* Admin Controls */}
				{isEditMode && (
					<div className='absolute top-3 right-3 z-30 flex gap-2'>
						<button
							onClick={(e) => { e.stopPropagation(); setIsEditing(true) }}
							className='rounded-lg px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 shadow-sm'
						>
							编辑
						</button>
						<button
							onClick={(e) => { e.stopPropagation(); onDelete?.() }}
							className='rounded-lg px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 transition-colors hover:bg-red-100 shadow-sm'
						>
							删除
						</button>
					</div>
				)}

				{/* Pin Button for Users */}
				{!isEditMode && (
					<button
						onClick={(e) => { e.stopPropagation(); onTogglePin?.(localItem) }}
						className={cn(
							'absolute top-4 right-4 z-30 p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100',
							localItem.isPinned ? 'bg-brand/20 text-brand shadow-sm' : 'bg-black/20 text-white/70 hover:bg-black/40 hover:text-white backdrop-blur-md'
						)}
						title={localItem.isPinned ? '取消置顶' : '置顶'}
					>
						<Pin className={cn('w-4 h-4', localItem.isPinned ? 'fill-current' : '')} />
					</button>
				)}

				<div
					className='flex h-full w-full items-center justify-center p-4 transition-all duration-500 relative z-10 cursor-pointer'
					onClick={handleCardClick}
				>
					{/* Overlay Cover Image */}
					{localItem.cover ? (
						<img
							src={localItem.cover}
							alt={localItem.name}
							className={cn(
								'absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110'
							)}
							referrerPolicy='no-referrer'
						/>
					) : (
						<div className='absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-neutral-800 text-neutral-400'>
							<span className='text-xs'>暂无图片</span>
						</div>
					)}

					{/* Play Button Overlay for Videos */}
					{targetType === 'videos' && (
						<div className='absolute inset-0 flex items-center justify-center pointer-events-none z-10'>
							<div className='flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-brand/90 text-white shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-brand'>
								<Play className='h-4 w-4 sm:h-5 sm:w-5 fill-current ml-0.5' />
							</div>
						</div>
					)}

					{/* Dark Mask for Hover state */}
					<div className='absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl z-10' />

					{/* Hover Content */}
					<div className='absolute inset-x-0 bottom-0 p-5 z-20 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-in-out pointer-events-none flex flex-col gap-2'>
						{/* Title */}
						<h3 className='text-sm font-bold text-white leading-snug line-clamp-2'>
							{localItem.name}
						</h3>

						{/* Subtitle / Creator */}
						{localItem.subtitle && (
							<span className='text-xs text-orange-400 font-medium truncate'>
								{localItem.subtitle}
							</span>
						)}

						{/* Description / Summary */}
						<p className='text-[11px] text-neutral-300 line-clamp-2 leading-relaxed font-sans'>
							{localItem.review || localItem.desc}
						</p>

						{/* Specific Fields: Stars rating (Games only) */}
						{targetType === 'games' && typeof localItem.stars === 'number' && (
							<div className='mt-1 flex items-center justify-between w-full'>
								<StarRating stars={localItem.stars} />
								{localItem.status && (
									<span className='rounded bg-brand/20 px-1.5 py-0.5 text-[9px] font-semibold text-brand backdrop-blur-sm'>
										{localItem.status}
									</span>
								)}
							</div>
						)}
					</div>
				</div>
			</motion.div>

			{/* Detail and Edit Modals */}
			{isDetailOpen && !isEditMode && (
				<FavoriteItemDetailModal
					item={localItem}
					targetType={targetType}
					onClose={() => setIsDetailOpen(false)}
					onEdit={() => {
						setIsDetailOpen(false)
						setIsEditing(true)
					}}
				/>
			)}
			{isEditing && (
				<FavoriteItemEditModal
					item={localItem}
					targetType={targetType}
					onClose={() => setIsEditing(false)}
					onSave={handleSave}
				/>
			)}
		</>
	)
}
