'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { X, UploadCloud } from 'lucide-react'
import { DialogModal } from '@/components/dialog-modal'
import EditableStarRating from '@/components/editable-star-rating'
import type { Movie } from './movie-card'

interface CreateDialogProps {
	movieList: Movie[]
	movies: Movie | null
	onClose: () => void
	onSave: (movies: Movie) => void
}

export default function CreateDialog({ movieList, movies, onClose, onSave }: CreateDialogProps) {
	const [formData, setFormData] = useState<Movie>({
		name: movies?.name || '',
		director: movies?.director || '',
		poster: movies?.poster || '',
		description: movies?.description || '',
		tags: [],
		stars: 3,
		isPinned: movies?.isPinned || false,
		isShow: movies?.isShow || false,
		doubanUrl: movies?.doubanUrl || ''
	})
	
	const [isUploadingPoster, setIsUploadingPoster] = useState(false)
	const posterInputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (movies) {
			setFormData(movies)
		} else {
			setFormData({
				name: '',
				director: '',
				poster: '',
				description: '',
				tags: [],
				stars: 3,
				isPinned: false,
				isShow: false,
				doubanUrl: ''
			})
		}
	}, [movies])

	const handleFieldChange = (field: keyof Movie, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }))
	}

	const handleTagsChange = (tagsStr: string) => {
		const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t)
		handleFieldChange('tags', tags)
	}

	const handleFileUpload = async (file: File, folder: string) => {
		const uploadFormData = new FormData()
		uploadFormData.append('file', file)
		uploadFormData.append('folder', folder)
		const res = await fetch('/api/upload', { method: 'POST', body: uploadFormData })
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

	const handleSubmit = () => {
		if (!formData.name.trim() || !formData.poster.trim() || !formData.director.trim() || !formData.description.trim()) {
			toast.error('请填写所有必填项')
			return
		}

		if (formData.tags.length === 0) {
			toast.error('请至少添加一个标签')
			return
		}

		onSave(formData)
		onClose()
		toast.success(movies ? '更新成功' : '添加成功')
	}

	const [isFetching, setIsFetching] = useState(false)

	const handleAutoFetch = async () => {
		if (!formData.name.trim()) {
			toast.error('请先输入电影名')
			return
		}
		setIsFetching(true)
		try {
			const res = await fetch(`/api/tmdb?query=${encodeURIComponent(formData.name)}`)
			const data = await res.json()
			
			if (!res.ok) {
				toast.error(`获取失败: ${data.error || '未知错误'}`)
				return
			}
			
			if (data.results && data.results.length > 0) {
				const movieInfo = data.results[0]
				let directorName = formData.director
				let newTags = [...formData.tags]
				
				try {
					const creditsRes = await fetch(`/api/tmdb?movieId=${movieInfo.id}`)
					const creditsData = await creditsRes.json()
					
					// Get director
					if (creditsData.credits && creditsData.credits.crew) {
						const directorData = creditsData.credits.crew.find((c: any) => c.job === 'Director')
						if (directorData) directorName = directorData.name
					}
					
					// Get genres
					if (creditsData.genres && creditsData.genres.length > 0) {
						const fetchedGenres = creditsData.genres.map((g: any) => g.name)
						// merge with existing tags without duplicates
						newTags = Array.from(new Set([...newTags, ...fetchedGenres]))
					}
				} catch (e) {
					console.error('Failed to fetch detailed movie info', e)
				}

				setFormData(prev => ({
					...prev,
					description: movieInfo.overview || prev.description,
					poster: movieInfo.poster_path ? `https://image.tmdb.org/t/p/w500${movieInfo.poster_path}` : prev.poster,
					director: directorName,
					tags: newTags
				}))
				toast.success('已自动获取电影信息与标签')
			} else {
				toast.error('未找到相关电影')
			}
		} catch (error) {
			toast.error('请求出错，请重试')
		} finally {
			setIsFetching(false)
		}
	}

	return (
		<DialogModal open onClose={onClose} className='card max-w-3xl w-full max-h-[90vh] p-8 md:p-10 relative bg-white flex flex-col shadow-2xl'>
			<div className='absolute top-6 right-6 sm:top-[27px] sm:right-8 md:top-[35px] md:right-10 z-20 flex items-center gap-3 bg-white/80 rounded-full px-2 py-1'>
				<button onClick={onClose} className='p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors'>
					<X className='w-5 h-5' />
				</button>
			</div>

			<div className='flex flex-col sm:flex-row gap-8 md:gap-12'>
				{/* Top Left: Poster Image (Uploadable) */}
				<div className='shrink-0 w-[140px] sm:w-[200px] mt-2'>
					<input type="file" accept="image/*" className="hidden" ref={posterInputRef} onChange={onPosterChange} />
					<div 
						className='group relative w-full aspect-[2/3] cursor-pointer rounded shadow-2xl shadow-black/15 ring-1 ring-black/5 overflow-hidden'
						onClick={() => posterInputRef.current?.click()}
					>
						{formData.poster ? (
							<img src={formData.poster} alt="Poster" className='w-full h-full object-cover' />
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
				</div>

				{/* Right: Details */}
				<div className='flex-1 flex flex-col min-w-0'>
					{/* Header Info */}
					<div className='shrink-0 mb-6' style={{ paddingRight: '7rem' }}>
						<div className='mb-3'>
							<input
								type='text'
								value={formData.tags.join(', ')}
								onChange={e => handleTagsChange(e.target.value)}
								placeholder='输入标签，用逗号分隔'
								className='w-full bg-neutral-50 px-3 py-1.5 rounded border border-neutral-200 text-xs text-neutral-600 focus:outline-none focus:border-neutral-400 transition-colors'
							/>
						</div>

						<div className="relative mb-2">
							<input
								type='text'
								value={formData.name}
								onChange={e => handleFieldChange('name', e.target.value)}
								placeholder='输入电影名 (必填)'
								className='w-full text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 leading-tight tracking-tight bg-transparent border-b border-transparent focus:border-neutral-200 focus:outline-none transition-colors pb-1 pr-12'
							/>
							<button
								onClick={handleAutoFetch}
								disabled={isFetching}
								title="自动获取电影信息"
								className='absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-brand transition-colors disabled:opacity-50'
							>
								{isFetching ? (
									<div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
								) : (
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
								)}
							</button>
						</div>
						
						<div className='flex items-center gap-2 mb-4'>
							<span className='text-neutral-500 font-medium text-[15px]'>导演:</span>
							<input
								type='text'
								value={formData.director}
								onChange={e => handleFieldChange('director', e.target.value)}
								placeholder='输入导演名 (必填)'
								className='flex-1 text-neutral-500 font-medium text-[15px] bg-transparent border-b border-transparent focus:border-neutral-200 focus:outline-none transition-colors pb-1'
							/>
						</div>
						
						<div className='mb-2 flex items-center gap-6'>
							<div className='flex items-center gap-3'>
								<span className="text-xs text-neutral-400 font-medium">评分</span>
								<EditableStarRating stars={formData.stars} editable={true} onChange={stars => handleFieldChange('stars', stars)} />
							</div>
							<label className='flex items-center gap-2 cursor-pointer'>
								<input 
									type='checkbox' 
									checked={formData.isShow || false} 
									onChange={e => handleFieldChange('isShow', e.target.checked)}
									className='w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900 accent-neutral-900'
								/>
								<span className="text-xs text-neutral-400 font-medium hover:text-neutral-900 transition-colors">展示到主页</span>
							</label>
						</div>
					</div>

					{/* Scrollable Area for Description */}
					<div className='flex-1 overflow-y-auto pr-4 pb-4 custom-scrollbar flex flex-col gap-6'>
						<div>
							<h4 className='text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-3'>剧情简介</h4>
							<textarea
								value={formData.description}
								onChange={e => handleFieldChange('description', e.target.value)}
								placeholder='输入详细简介 (必填)...'
								className='w-full text-[15px] text-neutral-600 leading-[1.8] font-light bg-neutral-50 p-4 rounded-xl border border-neutral-100 focus:outline-none focus:border-neutral-300 transition-colors resize-none min-h-[150px]'
							/>
						</div>
					</div>

					{/* Submit button */}
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
								value={formData.doubanUrl || ''}
								onChange={e => handleFieldChange('doubanUrl', e.target.value)}
								placeholder='豆瓣详情页链接 (选填)'
								className='w-full py-3 bg-white text-neutral-900 text-sm rounded-full font-medium transition-all border border-neutral-200 shadow-sm focus:outline-none placeholder:text-neutral-400'
								style={{ paddingLeft: '3.2rem', paddingRight: '1rem' }}
							/>
						</div>

						<button 
							onClick={handleSubmit} 
							className='w-full py-3.5 bg-neutral-900 text-white text-base rounded-full font-bold transition-all hover:bg-neutral-800 active:scale-[0.98] shadow-lg shadow-black/10'
						>
							{movies ? '保存更改' : '立即添加电影'}
						</button>
					</div>
				</div>
			</div>
		</DialogModal>
	)
}
