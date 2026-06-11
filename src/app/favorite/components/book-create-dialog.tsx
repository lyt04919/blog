'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { X, BookOpen, FileText, UploadCloud } from 'lucide-react'
import { DialogModal } from '@/components/dialog-modal'
import EditableStarRating from '@/components/editable-star-rating'
import type { Book } from './book-card'

interface CreateDialogProps {
	bookList: Book[]
	books: Book | null
	categories?: string[]
	onClose: () => void
	onSave: (books: Book) => void
}

export default function CreateDialog({ bookList, books, categories = [], onClose, onSave }: CreateDialogProps) {
	const [formData, setFormData] = useState<Book>({
		name: books?.name || '',
		author: books?.author || '',
		cover: books?.cover || '',
		description: books?.description || '',
		tags: books?.tags || [],
		stars: books?.stars || 3,
		recommendation: books?.recommendation || '',
		epubUrl: books?.epubUrl || '',
		pdfUrl: books?.pdfUrl || '',
		doubanUrl: books?.doubanUrl || '',
		isPinned: books?.isPinned || false,
		isShow: books?.isShow || false
	})

	const [isUploadingCover, setIsUploadingCover] = useState(false)
	const [isUploadingEpub, setIsUploadingEpub] = useState(false)
	const [isUploadingPdf, setIsUploadingPdf] = useState(false)
	
	const coverInputRef = useRef<HTMLInputElement>(null)
	const epubInputRef = useRef<HTMLInputElement>(null)
	const pdfInputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (books) {
			setFormData(books)
		} else {
			setFormData({
				name: '',
				author: '',
				cover: '',
				description: '',
				tags: [],
				stars: 3,
				recommendation: '',
				epubUrl: '',
				pdfUrl: '',
				doubanUrl: '',
				isPinned: false,
				isShow: false
			})
		}
	}, [books])

	const handleFieldChange = (field: keyof Book, value: any) => {
		setFormData(prev => ({ ...prev, [field]: value }))
	}

	const handleTagToggle = (tag: string) => {
		const newTags = formData.tags.includes(tag) ? formData.tags.filter(t => t !== tag) : [...formData.tags, tag]
		setFormData({ ...formData, tags: newTags })
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

	const onCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		try {
			setIsUploadingCover(true)
			const url = await handleFileUpload(file, 'images/uploads')
			handleFieldChange('cover', url)
		} catch (err) {
			console.error(err)
		} finally {
			setIsUploadingCover(false)
		}
	}

	const onEpubChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		try {
			setIsUploadingEpub(true)
			const url = await handleFileUpload(file, 'files/books')
			handleFieldChange('epubUrl', url)
		} catch (err) {
			console.error(err)
		} finally {
			setIsUploadingEpub(false)
		}
	}

	const onPdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		try {
			setIsUploadingPdf(true)
			const url = await handleFileUpload(file, 'files/books')
			handleFieldChange('pdfUrl', url)
		} catch (err) {
			console.error(err)
		} finally {
			setIsUploadingPdf(false)
		}
	}

	const handleSubmit = () => {
		if (!formData.name.trim() || !formData.cover.trim() || !formData.author.trim() || !formData.description.trim()) {
			toast.error('请填写所有必填项')
			return
		}

		if (formData.tags.length === 0) {
			toast.error('请至少添加一个标签')
			return
		}

		onSave(formData)
		onClose()
		toast.success(books ? '更新成功' : '添加成功')
	}

	const [isFetching, setIsFetching] = useState(false)

	const handleAutoFetch = async () => {
		if (!formData.name.trim()) {
			toast.error('请先输入书名')
			return
		}
		setIsFetching(true)
		try {
			const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(formData.name)}&media=ebook&entity=ebook`)
			const data = await res.json()
			if (data.results && data.results.length > 0) {
				const bookInfo = data.results[0]
				let newTags = [...formData.tags]
				
				if (bookInfo.genres && bookInfo.genres.length > 0) {
					// Exclude generic 'Books' tag
					const fetchedGenres = bookInfo.genres.filter((g: string) => g !== 'Books')
					newTags = Array.from(new Set([...newTags, ...fetchedGenres]))
				}

				setFormData(prev => ({
					...prev,
					author: bookInfo.artistName || prev.author,
					description: bookInfo.description || prev.description,
					cover: bookInfo.artworkUrl100 ? bookInfo.artworkUrl100.replace('100x100bb', '600x600bb') : prev.cover,
					tags: newTags
				}))
				toast.success('已自动获取书籍信息与标签')
			} else {
				toast.error('未找到相关书籍')
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
				{/* Top Left: Cover Image (Uploadable) */}
				<div className='shrink-0 w-[140px] sm:w-[200px] mt-2'>
					<input type="file" accept="image/*" className="hidden" ref={coverInputRef} onChange={onCoverChange} />
					<div 
						className='group relative w-full aspect-[2/3] cursor-pointer rounded shadow-2xl shadow-black/15 ring-1 ring-black/5 overflow-hidden'
						onClick={() => coverInputRef.current?.click()}
					>
						{formData.cover ? (
							<img src={formData.cover} alt="Cover" className='w-full h-full object-cover' />
						) : (
							<div className='w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-400 text-sm'>
								点击上传封面
							</div>
						)}
						<div className='absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
							<span className='text-white text-sm font-medium flex items-center gap-1'>
								<UploadCloud className="w-4 h-4"/> {isUploadingCover ? '上传中...' : '更换封面'}
							</span>
						</div>
					</div>
				</div>

				{/* Right: Details & Resources */}
				<div className='flex-1 flex flex-col min-w-0'>
					{/* Header Info */}
					<div className='shrink-0 mb-6' style={{ paddingRight: '7rem' }}>
						<div className="relative mb-2">
							<input
								type='text'
								value={formData.name}
								onChange={e => handleFieldChange('name', e.target.value)}
								placeholder='输入书名 (必填)'
								className='w-full text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 leading-tight tracking-tight bg-transparent border-b border-transparent focus:border-neutral-200 focus:outline-none transition-colors pb-1 pr-12'
							/>
							<button
								onClick={handleAutoFetch}
								disabled={isFetching}
								title="自动获取书籍信息"
								className='absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-brand transition-colors disabled:opacity-50'
							>
								{isFetching ? (
									<div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
								) : (
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
								)}
							</button>
						</div>
						
						<input
							type='text'
							value={formData.author}
							onChange={e => handleFieldChange('author', e.target.value)}
							placeholder='输入作者 (必填)'
							className='w-full text-neutral-500 font-medium text-[15px] mb-4 bg-transparent border-b border-transparent focus:border-neutral-200 focus:outline-none transition-colors pb-1'
						/>
						
						<div className='mb-4 flex items-center gap-6'>
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

						<div className='mb-2'>
							<div className='text-xs text-neutral-400 font-medium mb-2'>选择题材</div>
							<div className='flex flex-wrap gap-2'>
								{categories.map((tag: string) => {
									const isSelected = formData.tags.includes(tag)
									return (
										<label key={tag} className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors border ${isSelected ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'}`}>
											<input type='checkbox' className='hidden' checked={isSelected} onChange={() => handleTagToggle(tag)} />
											{tag}
										</label>
									)
								})}
							</div>
						</div>
					</div>

					{/* Scrollable Area for Description & Recommendation */}
					<div className='flex-1 overflow-y-auto pr-4 pb-4 custom-scrollbar flex flex-col gap-6'>
						<div className='pl-4 border-l-2 border-neutral-200 focus-within:border-neutral-800 transition-colors py-1'>
							<textarea
								value={formData.recommendation || ''}
								onChange={e => handleFieldChange('recommendation', e.target.value)}
								placeholder='写一句推荐语 (选填)...'
								className='w-full text-[15px] text-neutral-600 leading-relaxed italic bg-transparent focus:outline-none resize-none'
								rows={2}
							/>
						</div>

						<div>
							<h4 className='text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-3'>书籍简介</h4>
							<textarea
								value={formData.description}
								onChange={e => handleFieldChange('description', e.target.value)}
								placeholder='输入详细简介 (必填)...'
								className='w-full text-[15px] text-neutral-600 leading-[1.8] font-light bg-neutral-50 p-4 rounded-xl border border-neutral-100 focus:outline-none focus:border-neutral-300 transition-colors resize-none min-h-[150px]'
							/>
						</div>
					</div>

					{/* Action Buttons (File Uploads) */}
					<div className='pt-6 mt-auto bg-white flex flex-col gap-3 shrink-0 border-t border-neutral-100'>
						<div className='flex flex-col sm:flex-row gap-3'>
							<input type="file" accept=".epub" className="hidden" ref={epubInputRef} onChange={onEpubChange} />
							<button
								onClick={() => epubInputRef.current?.click()}
								className='flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 text-white text-sm rounded-full font-medium transition-all hover:bg-neutral-800 hover:shadow-lg active:scale-[0.98]'
							>
								{isUploadingEpub ? <UploadCloud className="w-4 h-4 animate-bounce" /> : <BookOpen className='w-4 h-4' />}
								<span className='truncate'>{isUploadingEpub ? '上传中...' : formData.epubUrl ? '已上传 EPUB (点击重新上传)' : '上传 EPUB 文件 (选填)'}</span>
							</button>

							<input type="file" accept=".pdf" className="hidden" ref={pdfInputRef} onChange={onPdfChange} />
							<button
								onClick={() => pdfInputRef.current?.click()}
								className='flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-neutral-900 text-sm rounded-full font-medium transition-all hover:bg-neutral-50 border border-neutral-200 shadow-sm active:scale-[0.98]'
							>
								{isUploadingPdf ? <UploadCloud className="w-4 h-4 animate-bounce" /> : <FileText className='w-4 h-4' />}
								<span className='truncate'>{isUploadingPdf ? '上传中...' : formData.pdfUrl ? '已上传 PDF (点击重新上传)' : '上传 PDF 文件 (选填)'}</span>
							</button>
						</div>

						<div className='relative flex items-center mt-1'>
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

						{/* Submit button */}
						<div className='mt-2'>
							<button 
								onClick={handleSubmit} 
								className='w-full py-3.5 bg-neutral-900 text-white text-base rounded-full font-bold transition-all hover:bg-neutral-800 active:scale-[0.98] shadow-lg shadow-black/10'
							>
								{books ? '保存更改' : '立即添加书籍'}
							</button>
						</div>
					</div>
				</div>
			</div>
		</DialogModal>
	)
}
