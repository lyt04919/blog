'use client'

import { useState, useRef } from 'react'
import { X, Save, UploadCloud } from 'lucide-react'
import { DialogModal } from '@/components/dialog-modal'
import EditableStarRating from '@/components/editable-star-rating'
import type { Movie } from './movie-card'

interface MovieEditModalProps {
	movie: Movie
	onClose: () => void
	onSave: (movie: Movie) => void
}

export default function MovieEditModal({ movie, onClose, onSave }: MovieEditModalProps) {
	const [localMovie, setLocalMovie] = useState(movie)
	const [isUploadingPoster, setIsUploadingPoster] = useState(false)
	const posterInputRef = useRef<HTMLInputElement>(null)

	const handleFieldChange = (field: keyof Movie, value: any) => {
		setLocalMovie(prev => ({ ...prev, [field]: value }))
	}

	const handleTagsChange = (tagsStr: string) => {
		const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t)
		handleFieldChange('tags', tags)
	}

	const handleFileUpload = async (file: File, folder: string) => {
		const formData = new FormData()
		formData.append('file', file)
		formData.append('folder', folder)
		const res = await fetch('/api/upload', { method: 'POST', body: formData })
		if (!res.ok) throw new Error('Upload failed')
		const data = await res.json()
		return data.url
	}

	const onPosterChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		try {
			setIsUploadingPoster(true)
			const url = await handleFileUpload(file, 'images/uploads')
			handleFieldChange('poster', url)
		} catch (err) {
			console.error(err)
		} finally {
			setIsUploadingPoster(false)
		}
	}

	return (
		<DialogModal open onClose={onClose} className='card max-w-3xl w-full max-h-[90vh] p-8 md:p-10 relative bg-white flex flex-col shadow-2xl'>
			{/* Mobile-only Absolute Close/Save Buttons */}
			<div className='sm:hidden absolute top-6 right-6 z-20 flex items-center gap-3 bg-white/80 rounded-full px-2 py-1'>
				<button 
					onClick={() => onSave(localMovie)} 
					className='flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white text-xs font-bold rounded-full hover:bg-neutral-800 transition-colors'
				>
					<Save className='w-3.5 h-3.5' /> 保存
				</button>
				<button onClick={onClose} className='p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors'>
					<X className='w-5 h-5' />
				</button>
			</div>

			{/* Desktop-only Close Button */}
			<button 
				onClick={onClose} 
				className='hidden sm:flex absolute top-8 right-8 md:top-10 md:right-10 z-20 p-2 text-neutral-400 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 rounded-full transition-colors'
			>
				<X className='w-5 h-5' />
			</button>

			<div className='flex flex-col sm:flex-row gap-8 md:gap-12 h-full'>
				{/* Top Left: Poster Image (Uploadable) */}
				<div className='shrink-0 w-[140px] sm:w-[200px] mt-2 flex flex-col'>
					<input type="file" accept="image/*" className="hidden" ref={posterInputRef} onChange={onPosterChange} />
					<div 
						className='group relative w-full aspect-[2/3] cursor-pointer rounded shadow-2xl shadow-black/15 ring-1 ring-black/5 overflow-hidden'
						onClick={() => posterInputRef.current?.click()}
					>
						{localMovie.poster ? (
							<img src={localMovie.poster} alt="Poster" className='w-full h-full object-cover' />
						) : (
							<div className='w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-400 text-sm'>
								点击上传海报
							</div>
						)}
						<div className='absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
							<span className='text-white text-sm font-medium flex items-center gap-1'>
								<UploadCloud className="w-4 h-4"/> {isUploadingPoster ? '上传中...' : '更换海报'}
							</span>
						</div>
					</div>
					
					{/* Desktop-only Save Button placed at Bottom Left */}
					<div className='hidden sm:flex mt-auto pt-6'>
						<button 
							onClick={() => onSave(localMovie)} 
							className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 text-white text-sm font-bold rounded-xl hover:bg-neutral-800 hover:shadow-lg active:scale-[0.98] transition-all'
						>
							<Save className='w-4 h-4' /> 保存修改
						</button>
					</div>
				</div>

				{/* Right: Details */}
				<div className='flex-1 flex flex-col min-w-0'>
					{/* Header Info */}
					<div className='shrink-0 mb-6' style={{ paddingRight: '3rem' }}>
						<div className='mb-3 relative flex items-center w-full'>
							<input
								type='text'
								value={localMovie.tags.join(', ')}
								onChange={e => handleTagsChange(e.target.value)}
								placeholder='输入标签，用逗号分隔'
								className='w-full bg-neutral-50 px-3 py-1.5 rounded border border-neutral-200 text-xs text-neutral-600 focus:outline-none focus:border-neutral-400 transition-colors'
							/>
						</div>

						<input
							type='text'
							value={localMovie.name}
							onChange={e => handleFieldChange('name', e.target.value)}
							placeholder='电影名'
							className='w-full text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 leading-tight mb-2 tracking-tight bg-transparent border-b border-transparent focus:border-neutral-200 focus:outline-none transition-colors pb-1'
						/>
						
						<div className='flex items-center gap-2 mb-4'>
							<span className='text-neutral-500 font-medium text-[15px]'>导演:</span>
							<input
								type='text'
								value={localMovie.director}
								onChange={e => handleFieldChange('director', e.target.value)}
								placeholder='导演名'
								className='flex-1 text-neutral-500 font-medium text-[15px] bg-transparent border-b border-transparent focus:border-neutral-200 focus:outline-none transition-colors pb-1'
							/>
						</div>
						
						<div className='mb-2 flex items-center gap-6'>
							<div className='flex items-center gap-3'>
								<span className="text-xs text-neutral-400 font-medium">评分</span>
								<EditableStarRating stars={localMovie.stars} editable={true} onChange={stars => handleFieldChange('stars', stars)} />
							</div>
							<label className='flex items-center gap-2 cursor-pointer'>
								<input 
									type='checkbox' 
									checked={localMovie.isShow || false} 
									onChange={e => handleFieldChange('isShow', e.target.checked)}
									className='w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900 accent-neutral-900'
								/>
								<span className="text-xs text-neutral-400 font-medium hover:text-neutral-900 transition-colors">展示到主页</span>
							</label>
						</div>
						<div className='mb-4 flex items-center gap-4'>
							<select
								value={localMovie.status || ''}
								onChange={e => handleFieldChange('status', e.target.value || undefined)}
								className='bg-neutral-50 border border-neutral-200 text-neutral-600 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-neutral-400'
							>
								<option value="">-- 选择状态 --</option>
								<option value="watched">已看</option>
								<option value="wishlist">想看</option>
							</select>
						</div>
					</div>

					{/* Scrollable Area for Description */}
					<div className='flex-1 overflow-y-auto pr-4 pb-4 custom-scrollbar flex flex-col gap-6'>
						<div className='pl-4 border-l-2 border-neutral-200 focus-within:border-neutral-800 transition-colors py-1'>
							<textarea
								value={localMovie.recommendation || ''}
								onChange={e => handleFieldChange('recommendation', e.target.value)}
								placeholder='写一句推荐语 (选填)...'
								className='w-full text-[15px] text-neutral-600 leading-relaxed italic bg-transparent focus:outline-none resize-none'
								rows={2}
							/>
						</div>
						<div>
							<h4 className='text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-3'>剧情简介</h4>
							<textarea
								value={localMovie.description}
								onChange={e => handleFieldChange('description', e.target.value)}
								placeholder='输入详细简介...'
								className='w-full text-[15px] text-neutral-600 leading-[1.8] font-light bg-neutral-50 p-4 rounded-xl border border-neutral-100 focus:outline-none focus:border-neutral-300 transition-colors resize-none min-h-[150px]'
							/>
						</div>
					</div>

					<div className='pt-6 mt-auto bg-white flex flex-col gap-3 shrink-0 border-t border-neutral-100'>
						<div className='relative flex items-center mb-1'>
							<div 
								className='absolute pointer-events-none flex items-center' 
								style={{ left: '0.75rem', top: 0, bottom: 0 }}
							>
								<div 
									className='rounded flex items-center justify-center text-white font-bold shadow-sm'
									style={{ backgroundColor: '#007722', width: '22px', height: '22px', fontSize: '12px' }}
								>
									豆
								</div>
							</div>
							<input
								type='url'
								value={localMovie.doubanUrl || ''}
								onChange={e => handleFieldChange('doubanUrl', e.target.value)}
								placeholder='豆瓣详情页链接 (选填)'
								className='w-full py-3 bg-white text-neutral-900 text-sm rounded-full font-medium transition-all border border-neutral-200 shadow-sm focus:outline-none placeholder:text-neutral-400'
								style={{ paddingLeft: '3.2rem', paddingRight: '1rem' }}
							/>
						</div>
					</div>
				</div>
			</div>
		</DialogModal>
	)
}
