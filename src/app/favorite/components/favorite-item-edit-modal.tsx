'use client'

import { useState, useRef } from 'react'
import { X, Save, UploadCloud, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { DialogModal } from '@/components/dialog-modal'
import EditableStarRating from '@/components/editable-star-rating'
import type { FavoriteItem } from './favorite-item-card'

interface FavoriteItemEditModalProps {
	item: FavoriteItem
	targetType: 'gears' | 'software' | 'music' | 'games' | 'videos'
	onClose: () => void
	onSave: (item: FavoriteItem) => void
}

export function FavoriteItemEditModal({ item, targetType, onClose, onSave }: FavoriteItemEditModalProps) {
	const [localItem, setLocalItem] = useState<FavoriteItem>(item)
	const [isUploading, setIsUploading] = useState(false)
	const [autoUrl, setAutoUrl] = useState('')
	const [isParsing, setIsParsing] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleAutoParse = async (inputUrl?: string | React.MouseEvent) => {
		const targetUrl = typeof inputUrl === 'string' ? inputUrl : autoUrl;
		if (!targetUrl.trim()) {
			toast.error('请输入有效的链接')
			return
		}
		try {
			setIsParsing(true)
			const res = await fetch(`/api/parse-video-url?url=${encodeURIComponent(targetUrl.trim())}`)
			if (!res.ok) {
				throw new Error('解析失败')
			}
			const data = await res.json()
			if (data.error) {
				throw new Error(data.error)
			}
			
			setLocalItem(prev => ({
				...prev,
				name: data.title || prev.name,
				desc: data.desc || prev.desc,
				cover: data.cover || prev.cover,
				subtitle: data.subtitle || prev.subtitle,
				link: data.embedLink || targetUrl || prev.link
			}))
			toast.success('解析成功，已自动填充！')
		} catch (err: any) {
			toast.error(`解析失败: ${err.message || '未知错误'}`)
		} finally {
			setIsParsing(false)
		}
	}

	const handleFieldChange = (field: keyof FavoriteItem, value: any) => {
		setLocalItem(prev => ({ ...prev, [field]: value }))
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

	const onCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		try {
			setIsUploading(true)
			const url = await handleFileUpload(file, 'images/uploads')
			handleFieldChange('cover', url)
		} catch (err) {
			console.error(err)
		} finally {
			setIsUploading(false)
		}
	}

	// Subtitle labels and placeholder helper
	const subtitleLabel = {
		gears: '品牌 / 厂商',
		software: '开发者 / 团队',
		music: '艺术家 / 栏目',
		games: '平台 (例如 Switch, PC)',
		videos: '作者 / Up主'
	}[targetType]

	const showStars = targetType === 'games'
	const showEmbedCode = targetType === 'music'
	const showStatusSelect = targetType === 'games'

	return (
		<DialogModal open onClose={onClose} className='card max-w-3xl w-full max-h-[90vh] p-8 md:p-10 relative bg-white flex flex-col shadow-2xl overflow-y-auto'>
			{/* Mobile Close/Save Buttons */}
			<div className='sm:hidden absolute top-6 right-6 z-20 flex items-center gap-3 bg-white/80 rounded-full px-2 py-1'>
				<button 
					onClick={() => onSave(localItem)} 
					className='flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white text-xs font-bold rounded-full hover:bg-neutral-800 transition-colors'
				>
					<Save className='w-3.5 h-3.5' /> 保存
				</button>
				<button onClick={onClose} className='p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors'>
					<X className='w-5 h-5' />
				</button>
			</div>

			{/* Desktop Close Button */}
			<button 
				onClick={onClose} 
				className='hidden sm:flex absolute top-8 right-8 md:top-10 md:right-10 z-20 p-2 text-neutral-400 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 rounded-full transition-colors'
			>
				<X className='w-5 h-5' />
			</button>

			<div className='flex flex-col sm:flex-row gap-8 md:gap-12 h-full'>
				{/* Left Side: Cover Image Upload */}
				<div className='shrink-0 w-[140px] sm:w-[200px] mt-2 flex flex-col'>
					<input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={onCoverChange} />
					<div 
						className='group relative w-full aspect-square cursor-pointer rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden bg-neutral-50 flex items-center justify-center'
						onClick={() => fileInputRef.current?.click()}
					>
						{localItem.cover ? (
							<img src={localItem.cover} alt="Cover" className='w-full h-full object-cover' referrerPolicy='no-referrer' />
						) : (
							<div className='w-full h-full p-4 flex flex-col items-center justify-center text-neutral-400 text-xs text-center gap-2'>
								<UploadCloud className="w-6 h-6"/>
								点击上传封面图片
							</div>
						)}
						<div className='absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
							<span className='text-white text-xs font-medium flex items-center gap-1'>
								<UploadCloud className="w-3.5 h-3.5"/> {isUploading ? '上传中...' : '更换封面'}
							</span>
						</div>
					</div>
					
					{/* Desktop Save Button */}
					<div className='hidden sm:flex mt-auto pt-6'>
						<button 
							onClick={() => onSave(localItem)} 
							className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 text-white text-sm font-bold rounded-xl hover:bg-neutral-800 hover:shadow-lg active:scale-[0.98] transition-all'
						>
							<Save className='w-4 h-4' /> 保存修改
						</button>
					</div>
				</div>

				{/* Right Side: Form Inputs */}
				<div className='flex-1 flex flex-col min-w-0'>
					<div className='shrink-0 mb-6' style={{ paddingRight: '2.5rem' }}>
						{/* URL Auto-parse helper */}
						{targetType === 'videos' && (
							<div className='mb-4 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 flex flex-col gap-2'>
								<label className='text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase flex items-center gap-1'>
									<Sparkles className='w-3 h-3 animate-pulse' />
									自动填充 (支持 Bilibili / YouTube / 网页链接)
								</label>
								<div className='flex gap-2'>
									<input
										type='url'
										value={autoUrl}
										onChange={e => setAutoUrl(e.target.value)}
										onKeyDown={e => {
											if (e.key === 'Enter') {
												e.preventDefault();
												handleAutoParse();
											}
										}}
										placeholder='粘贴视频页面链接，如 https://www.bilibili.com/video/...'
										className='flex-1 bg-white dark:bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 focus:outline-none focus:border-neutral-400 transition-colors'
									/>
									<button
										type='button'
										disabled={isParsing}
										onClick={handleAutoParse}
										className='px-3 py-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg active:scale-95 transition-all shadow disabled:opacity-50 shrink-0'
									>
										{isParsing ? '解析中...' : '解析'}
									</button>
								</div>
							</div>
						)}

						{/* Category input */}
						<div className='mb-3 relative flex items-center w-full'>
							<input
								type='text'
								value={localItem.category || ''}
								onChange={e => handleFieldChange('category', e.target.value)}
								placeholder='分类 (例如：键盘、显示器、主机)'
								className='w-full bg-neutral-50 px-3 py-1.5 rounded border border-neutral-200 text-xs text-neutral-600 focus:outline-none focus:border-neutral-400 transition-colors'
							/>
						</div>

						{/* Title/Name */}
						<input
							type='text'
							value={localItem.name}
							onChange={e => handleFieldChange('name', e.target.value)}
							placeholder='项目名称'
							className='w-full text-xl sm:text-2xl font-extrabold text-neutral-900 leading-tight mb-2 tracking-tight bg-transparent border-b border-transparent focus:border-neutral-200 focus:outline-none transition-colors pb-1'
						/>
						
						{/* Subtitle / Creator */}
						<div className='flex items-center gap-2 mb-4'>
							<span className='text-neutral-400 text-xs font-medium shrink-0'>{subtitleLabel}:</span>
							<input
								type='text'
								value={localItem.subtitle || ''}
								onChange={e => handleFieldChange('subtitle', e.target.value)}
								placeholder={`请输入 ${subtitleLabel}`}
								className='flex-1 text-neutral-600 font-medium text-sm bg-transparent border-b border-transparent focus:border-neutral-200 focus:outline-none transition-colors pb-1'
							/>
						</div>
						
						{/* Rating & Display Options */}
						<div className='mb-2 flex flex-wrap items-center gap-6'>
							{showStars && (
								<div className='flex items-center gap-3'>
									<span className="text-xs text-neutral-400 font-medium">评分</span>
									<EditableStarRating 
										stars={localItem.stars || 5} 
										editable={true} 
										onChange={stars => handleFieldChange('stars', stars)} 
									/>
								</div>
							)}
							<label className='flex items-center gap-2 cursor-pointer'>
								<input 
									type='checkbox' 
									checked={localItem.isShow || false} 
									onChange={e => handleFieldChange('isShow', e.target.checked)}
									className='w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900 accent-neutral-900'
								/>
								<span className="text-xs text-neutral-400 font-medium hover:text-neutral-900 transition-colors">展示到大盘</span>
							</label>
						</div>

						{/* Game status selection */}
						{showStatusSelect && (
							<div className='mb-4 flex items-center gap-4'>
								<select
									value={localItem.status || ''}
									onChange={e => handleFieldChange('status', e.target.value || undefined)}
									className='bg-neutral-50 border border-neutral-200 text-neutral-600 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-neutral-400'
								>
									<option value="">-- 游戏状态 --</option>
									<option value="正在玩">正在玩</option>
									<option value="已通关">已通关</option>
									<option value="想玩">想玩</option>
								</select>
							</div>
						)}
					</div>

					{/* Description Areas */}
					<div className='flex-1 pr-4 pb-4 flex flex-col gap-4 min-h-[220px]'>
						{/* Short Review */}
						<div className='pl-4 border-l-2 border-neutral-200 focus-within:border-neutral-800 transition-colors py-1'>
							<textarea
								value={localItem.review || ''}
								onChange={e => handleFieldChange('review', e.target.value)}
								placeholder='写一句推荐语/简评 (选填)...'
								className='w-full text-sm text-neutral-600 leading-relaxed italic bg-transparent focus:outline-none resize-none'
								rows={2}
							/>
						</div>

						{/* Long Description */}
						<div className='flex-1 flex flex-col min-h-[120px]'>
							<h4 className='text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-2'>详细介绍</h4>
							<textarea
								value={localItem.desc || ''}
								onChange={e => handleFieldChange('desc', e.target.value)}
								placeholder='输入详细描述与推荐理由...'
								className='w-full flex-1 text-sm text-neutral-600 leading-[1.7] bg-neutral-50 p-3 rounded-xl border border-neutral-100 focus:outline-none focus:border-neutral-300 transition-colors resize-none'
							/>
						</div>
					</div>

					{/* Links / Audio Player Code embeds */}
					<div className='pt-4 mt-auto bg-white flex flex-col gap-3 shrink-0 border-t border-neutral-100'>
						{/* Embed code for music */}
						{showEmbedCode && (
							<div className='flex flex-col gap-1'>
								<label className='text-[10px] text-neutral-400 font-bold uppercase'>播放器内嵌代码 (例如 Spotify/网易云 iframe，选填)</label>
								<textarea
									value={localItem.embedCode || ''}
									onChange={e => handleFieldChange('embedCode', e.target.value)}
									placeholder='<iframe ...></iframe>'
									className='w-full bg-neutral-50 p-2 text-xs rounded border focus:outline-none focus:border-neutral-400 font-mono'
									rows={2}
								/>
							</div>
						)}

						{/* Hyperlink */}
						<div className='flex gap-2 items-center mb-1'>
							<input
								type='url'
								value={localItem.link || ''}
								onChange={e => handleFieldChange('link', e.target.value)}
								onKeyDown={e => {
									if (e.key === 'Enter') {
										e.preventDefault();
										handleAutoParse(localItem.link || '');
									}
								}}
								placeholder={targetType === 'videos' ? '视频播放嵌入链接 (如 Bilibili iframe 页面地址, YouTube embed)' : '产品购买链接 / 官网地址 (选填)'}
								className='flex-1 py-2.5 px-4 bg-white text-neutral-900 text-xs rounded-xl transition-all border border-neutral-200 shadow-sm focus:outline-none placeholder:text-neutral-400'
							/>
							{localItem.link && (
								<button
									type='button'
									disabled={isParsing}
									onClick={() => handleAutoParse(localItem.link || '')}
									className='px-3 py-2.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl active:scale-95 transition-all shadow disabled:opacity-50 shrink-0 flex items-center gap-1 font-sans'
								>
									{isParsing ? '解析中...' : '自动解析'}
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</DialogModal>
	)
}
