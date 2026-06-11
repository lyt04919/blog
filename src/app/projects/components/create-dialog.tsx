'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, X, UploadCloud, Github, Package } from 'lucide-react'
import ImageUploadDialog, { type ImageItem } from './image-upload-dialog'
import type { Project } from './project-card'
import { DialogModal } from '@/components/dialog-modal'

interface CreateDialogProps {
	project: Project | null
	onClose: () => void
	onSave: (project: Project) => void
}

export default function CreateDialog({ project, onClose, onSave }: CreateDialogProps) {
	const [formData, setFormData] = useState<Project>({
		name: '',
		year: new Date().getFullYear(),
		image: '',
		url: '',
		description: '',
		tags: [],
		github: undefined,
		npm: undefined
	})
	const [showImageDialog, setShowImageDialog] = useState(false)
	const [tagsInput, setTagsInput] = useState('')

	useEffect(() => {
		if (project) {
			setFormData(project)
			setTagsInput(project.tags.join(', '))
		} else {
			setFormData({
				name: '',
				year: new Date().getFullYear(),
				image: '',
				url: '',
				description: '',
				tags: [],
				github: undefined,
				npm: undefined
			})
			setTagsInput('')
		}
	}, [project])

	const handleImageSubmit = (image: ImageItem) => {
		const imageUrl = image.type === 'url' ? image.url : image.previewUrl
		setFormData({ ...formData, image: imageUrl })
	}

	const handleTagsChange = (value: string) => {
		setTagsInput(value)
		const tags = value
			.split(',')
			.map(t => t.trim())
			.filter(t => t)
		setFormData({ ...formData, tags })
	}

	const handleSubmit = () => {
		if (!formData.name.trim() || !formData.image.trim() || !formData.url.trim() || !formData.description.trim()) {
			toast.error('请填写所有必填项')
			return
		}

		if (formData.tags.length === 0) {
			toast.error('请至少添加一个标签')
			return
		}

		onSave(formData)
		onClose()
		toast.success(project ? '更新成功' : '添加成功')
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
					<div 
						className='group relative w-full aspect-square cursor-pointer rounded-2xl shadow-2xl shadow-black/15 ring-1 ring-black/5 overflow-hidden bg-neutral-100 flex items-center justify-center'
						onClick={() => setShowImageDialog(true)}
					>
						{formData.image ? (
							<img src={formData.image} alt="Project Logo" className='w-full h-full object-cover' />
						) : (
							<div className='text-neutral-400 text-sm font-medium flex flex-col items-center gap-2'>
								<UploadCloud className="w-8 h-8 opacity-50"/>
								点击上传图标
							</div>
						)}
						<div className='absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
							<span className='text-white text-sm font-medium flex items-center gap-1'>
								<UploadCloud className="w-4 h-4"/> 更换图标
							</span>
						</div>
					</div>
				</div>

				{/* Right: Details & Resources */}
				<div className='flex-1 flex flex-col min-w-0'>
					{/* Header Info */}
					<div className='shrink-0 mb-6' style={{ paddingRight: '2rem' }}>
						<div className="relative mb-2">
							<input
								type='text'
								value={formData.name}
								onChange={e => setFormData({ ...formData, name: e.target.value })}
								placeholder='输入项目名称 (必填)'
								className='w-full text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 leading-tight tracking-tight bg-transparent border-b border-transparent focus:border-neutral-200 focus:outline-none transition-colors pb-1'
							/>
						</div>
						
						<div className='flex items-center gap-4 mb-4'>
							<input
								type='number'
								value={formData.year}
								onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
								placeholder='年份'
								className='w-24 text-neutral-500 font-medium text-[15px] bg-transparent border-b border-transparent focus:border-neutral-200 focus:outline-none transition-colors pb-1'
							/>
							<input
								type='url'
								value={formData.url}
								onChange={e => setFormData({ ...formData, url: e.target.value })}
								placeholder='输入项目主页 URL (必填)'
								className='flex-1 text-neutral-500 font-medium text-[15px] bg-transparent border-b border-transparent focus:border-neutral-200 focus:outline-none transition-colors pb-1'
							/>
						</div>

						<div className='mb-3'>
							<input
								type='text'
								value={tagsInput}
								onChange={e => handleTagsChange(e.target.value)}
								placeholder='输入标签，用逗号分隔 (如: React, Vue)'
								className='w-full bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-200 text-sm text-neutral-600 focus:outline-none focus:border-neutral-400 transition-colors'
							/>
							<div className='mt-2 flex flex-wrap gap-1.5'>
								{formData.tags.map(tag => (
									<span key={tag} className='rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600 border border-neutral-200'>
										{tag}
									</span>
								))}
							</div>
						</div>
					</div>

					{/* Scrollable Area for Description */}
					<div className='flex-1 overflow-y-auto pr-4 pb-4 custom-scrollbar flex flex-col gap-6'>
						<div>
							<h4 className='text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-3'>项目介绍</h4>
							<textarea
								value={formData.description}
								onChange={e => setFormData({ ...formData, description: e.target.value })}
								placeholder='输入详细项目介绍 (必填)...'
								className='w-full text-[15px] text-neutral-600 leading-[1.8] font-light bg-neutral-50 p-4 rounded-xl border border-neutral-100 focus:outline-none focus:border-neutral-300 transition-colors resize-none min-h-[120px]'
							/>
						</div>

						<div className='space-y-3'>
							<div className='relative flex items-center'>
								<div className='absolute text-neutral-400' style={{ left: '1rem' }}><Github className="w-4 h-4"/></div>
								<input
									type='url'
									value={formData.github || ''}
									onChange={e => setFormData({ ...formData, github: e.target.value || undefined })}
									placeholder='GitHub URL (可选)'
									className='w-full py-3 bg-white text-neutral-900 text-sm rounded-xl font-medium transition-all border border-neutral-200 shadow-sm focus:outline-none focus:border-neutral-400 placeholder:text-neutral-400 pr-4'
									style={{ paddingLeft: '2.8rem' }}
								/>
							</div>
							<div className='relative flex items-center'>
								<div className='absolute text-neutral-400' style={{ left: '1rem' }}><Package className="w-4 h-4"/></div>
								<input
									type='url'
									value={formData.npm || ''}
									onChange={e => setFormData({ ...formData, npm: e.target.value || undefined })}
									placeholder='NPM URL (可选)'
									className='w-full py-3 bg-white text-neutral-900 text-sm rounded-xl font-medium transition-all border border-neutral-200 shadow-sm focus:outline-none focus:border-neutral-400 placeholder:text-neutral-400 pr-4'
									style={{ paddingLeft: '2.8rem' }}
								/>
							</div>
						</div>
					</div>

					{/* Submit button */}
					<div className='pt-6 mt-auto bg-white flex flex-col gap-3 shrink-0 border-t border-neutral-100'>
						<button 
							onClick={handleSubmit} 
							className='w-full py-3.5 bg-neutral-900 text-white text-base rounded-full font-bold transition-all hover:bg-neutral-800 active:scale-[0.98] shadow-lg shadow-black/10'
						>
							{project ? '保存更改' : '立即添加项目'}
						</button>
					</div>
				</div>
			</div>

			{showImageDialog && <ImageUploadDialog currentImage={formData.image} onClose={() => setShowImageDialog(false)} onSubmit={handleImageSubmit} />}
		</DialogModal>
	)
}
