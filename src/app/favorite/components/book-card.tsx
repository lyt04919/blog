'use client'

import { motion } from 'motion/react'
import StarRating from '@/components/star-rating'
import { useSize } from '@/hooks/use-size'
import { cn } from '@/lib/utils'
import EditableStarRating from '@/components/editable-star-rating'
import { useState, useEffect } from 'react'
import LogoUploadDialog, { type LogoItem } from './logo-upload-dialog'
import BookDetailModal from './book-detail-modal'
import BookEditModal from './book-edit-modal'
import { Pin } from 'lucide-react'

export interface Book {
	name: string
	cover: string
	author: string
	description: string
	tags: string[]
	stars: number
	recommendation?: string
	epubUrl?: string
	pdfUrl?: string
	doubanUrl?: string
	isPinned?: boolean
	isShow?: boolean
	status?: 'reading' | 'finished' | 'wishlist'
	progress?: number
}

interface BookCardProps {
	book: Book
	categories?: string[]
	isEditMode?: boolean
	onUpdate?: (book: Book, oldBook: Book, logoItem?: LogoItem) => void
	onDelete?: () => void
	onTogglePin?: (book: Book) => void
}

export function BookCard({ book, categories = [], isEditMode = false, onUpdate, onDelete, onTogglePin }: BookCardProps) {
	const [expanded, setExpanded] = useState(false)
	const { maxSM } = useSize()
	const [localBook, setLocalBook] = useState(book)
	const [showLogoDialog, setShowLogoDialog] = useState(false)
	const [logoItem, setLogoItem] = useState<LogoItem | null>(null)
	const [isDetailOpen, setIsDetailOpen] = useState(false)

	useEffect(() => {
		setLocalBook(book)
	}, [book])

	const handleFieldChange = (field: keyof Book, value: any) => {
		const updated = { ...localBook, [field]: value }
		setLocalBook(updated)
		onUpdate?.(updated, book, logoItem || undefined)
	}

	const handleCoverSubmit = (logo: LogoItem) => {
		setLogoItem(logo)
		const logoUrl = logo.type === 'url' ? logo.url : logo.previewUrl
		const updated = { ...localBook, cover: logoUrl }
		setLocalBook(updated)
		onUpdate?.(updated, book, logo)
	}

	const handleTagToggle = (tag: string) => {
		const newTags = localBook.tags.includes(tag) ? localBook.tags.filter((t: string) => t !== tag) : [...localBook.tags, tag]
		handleFieldChange('tags', newTags)
	}

	const canEdit = isEditMode
	const showNormalLayout = !isEditMode

	const [isEditing, setIsEditing] = useState(false)

	const handleSave = (updatedBook: Book) => {
		onUpdate?.(updatedBook, book)
		setIsEditing(false)
	}

	return (
		<>
			<motion.div
				initial={{ opacity: 0, scale: 0.6 }}
				{...(maxSM ? { animate: { opacity: 1, scale: 1 } } : { whileInView: { opacity: 1, scale: 1 } })}
				className='relative block overflow-hidden group w-full aspect-[2/3] bg-white/30 backdrop-blur-sm border border-white/60 rounded-3xl hover:border-slate-700/80 hover:bg-slate-800/95 transition-all duration-500 shadow-sm'
			>
				{isEditMode && (
					<div className='absolute top-3 right-3 z-30 flex gap-2'>
						<button onClick={() => setIsEditing(true)} className='rounded-lg px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 shadow-sm'>
							编辑
						</button>
						<button onClick={onDelete} className='rounded-lg px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 transition-colors hover:bg-red-100 shadow-sm'>
							删除
						</button>
					</div>
				)}

				{!isEditMode && (
					<button 
						onClick={(e) => {
							e.stopPropagation()
							onTogglePin?.(localBook)
						}}
						className={cn(
							'absolute top-4 right-4 z-30 p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100',
							localBook.isPinned ? 'bg-brand/20 text-brand shadow-sm' : 'bg-black/20 text-white/70 hover:bg-black/40 hover:text-white backdrop-blur-md'
						)}
						title={localBook.isPinned ? '取消置顶' : '置顶到前面'}
					>
						<Pin className={cn('w-4 h-4', localBook.isPinned ? 'fill-current' : '')} />
					</button>
				)}

				<div 
					className='flex h-full w-full items-center justify-center px-4 py-6 transition-all duration-500 book-perspective relative z-10 cursor-pointer'
					onClick={() => {
						if (isEditMode) {
							setIsEditing(true)
						} else {
							setIsDetailOpen(true)
						}
					}}
				>
					{/* Top text: Title and Author (fades and slides down on hover) */}
					<div className='text-center z-20 absolute top-4 left-6 right-6 opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-in-out pointer-events-none'>
						<h3 className='my-0 text-base font-bold leading-tight text-white line-clamp-2'>
							{localBook.name}
						</h3>
						<p className='text-xs mt-1 text-orange-400 truncate'>
							{localBook.author}
						</p>
					</div>

					{/* Centering box that constrains height */}
					<div className='flex items-center justify-center w-full h-[85%] my-auto relative'>
						{/* Wrapper for ambient shadow and 3D cover */}
						<div className="relative w-fit h-full flex items-center justify-center">
									{/* Ambient Shadow (Blurred Clone) placed behind the 3D cover, SYNCED rotating via CSS */}
									{localBook.cover && (
										<img
											src={localBook.cover}
											alt=""
											className='ambient-shadow-book absolute inset-0 w-full h-full object-fill blur-[30px] opacity-0 group-hover:opacity-80 pointer-events-none'
											aria-hidden="true"
										/>
									)}

							{/* 3D Book Cover Container (w-fit ensures width matches cover image exactly) */}
							<div
								className='relative transition-transform duration-[0.5s] ease-in-out transform-three-d book-3d w-fit h-full flex items-center justify-center'
								style={{ '--book-height': '20px' } as React.CSSProperties}
							>
								{localBook.cover ? (
									<>
										<img
											src={localBook.cover}
											alt={localBook.name}
											className="h-full w-auto rounded-[3px] lg:group-hover:rounded-l-lg lg:group-hover:rounded-r-none transition-all duration-500 object-contain shadow-2xl group-hover:shadow-none relative"
										/>
										{/* Book Spine Illusion (Front View) */}
										<div className="absolute inset-0 rounded-[3px] lg:group-hover:rounded-l-lg lg:group-hover:rounded-r-none shadow-[inset_8px_0_16px_rgba(0,0,0,0.35),_inset_1px_0_2px_rgba(255,255,255,0.8)] pointer-events-none transition-all duration-500" />
									</>
								) : (
									<div className='flex h-full w-[110px] sm:w-[150px] items-center justify-center rounded-[3px] border border-dashed border-neutral-300 bg-white/20 text-neutral-500'>
										<span className='text-xs'>暂无封面</span>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Dark bottom gradient overlay for text readability */}
					<div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-slate-900/95 via-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none rounded-b-3xl" />

					{/* Bottom text: Stars and quote (fades and slides up on hover) */}
					<div className='text-center z-20 absolute bottom-4 left-0 right-0 px-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-in-out flex flex-col items-center gap-1.5 pointer-events-none'>
						<StarRating stars={localBook.stars} />
						
						{localBook.recommendation ? (
							<p className='text-[11px] text-neutral-200 line-clamp-3 leading-relaxed w-full font-serif text-center mt-1'>
								{localBook.recommendation}
							</p>
						) : (
							<p className='text-[10px] text-neutral-400 line-clamp-2 leading-snug w-full text-center mt-1'>
								{localBook.description}
							</p>
						)}
					</div>
				</div>
			</motion.div>
			
			{isDetailOpen && !isEditMode && <BookDetailModal book={localBook} onClose={() => setIsDetailOpen(false)} />}
			{isEditing && <BookEditModal book={localBook} onClose={() => setIsEditing(false)} onSave={handleSave} />}
		</>
	)
}
