'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useSize } from '@/hooks/use-size'
import ImageUploadDialog, { type ImageItem } from './image-upload-dialog'

export interface Project {
	name: string
	year: number
	description: string
	image: string
	url: string
	tags: string[]
	github?: string
	npm?: string
}

interface ProjectCardProps {
	project: Project
	isEditMode?: boolean
	onUpdate?: (project: Project, oldProject: Project, imageItem?: ImageItem) => void
	onDelete?: () => void
}

export function ProjectCard({ project, isEditMode = false, onUpdate, onDelete }: ProjectCardProps) {
	const [isEditing, setIsEditing] = useState(false)
	const { maxSM } = useSize()
	const [localProject, setLocalProject] = useState(project)
	const [showImageDialog, setShowImageDialog] = useState(false)
	const [imageItem, setImageItem] = useState<ImageItem | null>(null)

	const handleFieldChange = (field: keyof Project, value: any) => {
		const updated = { ...localProject, [field]: value }
		setLocalProject(updated)
		onUpdate?.(updated, project, imageItem || undefined)
	}

	const handleImageSubmit = (image: ImageItem) => {
		setImageItem(image)
		const imageUrl = image.type === 'url' ? image.url : image.previewUrl
		const updated = { ...localProject, image: imageUrl }
		setLocalProject(updated)
		onUpdate?.(updated, project, image)
	}

	const handleTagsChange = (tagsStr: string) => {
		const tags = tagsStr
			.split(',')
			.map(t => t.trim())
			.filter(t => t)
		handleFieldChange('tags', tags)
	}

	const handleCancel = () => {
		setLocalProject(project)
		setIsEditing(false)
		setImageItem(null)
	}

	const canEdit = isEditMode && isEditing

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			{...(maxSM ? { animate: { opacity: 1, scale: 1 } } : { whileInView: { opacity: 1, scale: 1 } })}
			className='relative flex flex-col gap-5 p-6 rounded-2xl border border-neutral-100 shadow-sm bg-white transition-shadow hover:shadow-md'>
			{isEditMode && (
				<div className='absolute top-3 right-3 z-10 flex gap-2'>
					{isEditing ? (
						<>
							<button onClick={handleCancel} className='rounded-lg px-2 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-600'>
								取消
							</button>
							<button onClick={() => setIsEditing(false)} className='rounded-lg px-2 py-1.5 text-xs text-blue-400 transition-colors hover:text-blue-600'>
								完成
							</button>
						</>
					) : (
						<>
							<button onClick={() => setIsEditing(true)} className='rounded-lg px-2 py-1.5 text-xs text-blue-400 transition-colors hover:text-blue-600'>
								编辑
							</button>
							<button onClick={onDelete} className='rounded-lg px-2 py-1.5 text-xs text-red-400 transition-colors hover:text-red-600'>
								删除
							</button>
						</>
					)}
				</div>
			)}

			<div className='flex items-start gap-5'>
				<div className='group relative shrink-0'>
					<img
						src={localProject.image}
						alt={localProject.name}
						className={cn('h-16 w-16 rounded-2xl object-cover border border-neutral-100', canEdit && 'cursor-pointer')}
						onClick={() => canEdit && setShowImageDialog(true)}
					/>
					{canEdit && (
						<div className='pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
							<span className='text-xs text-white'>更换</span>
						</div>
					)}
				</div>
				<div className='flex flex-col gap-2 pt-1'>
					<div className='flex items-center gap-3'>
						<h3
							contentEditable={canEdit}
							suppressContentEditableWarning
							onBlur={e => handleFieldChange('name', e.currentTarget.textContent || '')}
							className={cn('text-lg font-bold text-neutral-900', canEdit && 'cursor-text focus:outline-none border-b border-neutral-200')}>
							{localProject.name}
						</h3>
						{canEdit ? (
							<input
								type='number'
								value={localProject.year}
								onChange={e => handleFieldChange('year', parseInt(e.target.value) || 0)}
								className='text-neutral-500 w-16 rounded-md border border-neutral-200 px-2 py-0.5 text-sm focus:outline-none focus:border-neutral-400'
							/>
						) : (
							<span className='text-neutral-400 text-sm font-medium'>{localProject.year}</span>
						)}
					</div>
					<div className='flex flex-wrap gap-2'>
						{canEdit ? (
							<input
								type='text'
								value={localProject.tags.join(', ')}
								onChange={e => handleTagsChange(e.target.value)}
								placeholder='标签，用逗号分隔'
								className='bg-neutral-50 w-full rounded-md border border-neutral-200 px-2 py-1 text-xs focus:outline-none focus:border-neutral-400'
							/>
						) : (
							localProject.tags.map(tag => (
								<span key={tag} className='flex items-center bg-neutral-100 text-neutral-500 px-2.5 py-1 rounded-full text-xs font-medium'>
									{tag}
								</span>
							))
						)}
					</div>
				</div>
			</div>

			<p
				contentEditable={canEdit}
				suppressContentEditableWarning
				onBlur={e => handleFieldChange('description', e.currentTarget.textContent || '')}
				className={cn('text-neutral-600 text-sm leading-relaxed min-h-[3rem]', canEdit && 'cursor-text focus:outline-none border-b border-neutral-200')}>
				{localProject.description}
			</p>

			<div className='flex flex-wrap items-center gap-3 mt-1'>
				{canEdit ? (
					<>
						<input
							type='url'
							value={localProject.url}
							onChange={e => handleFieldChange('url', e.target.value)}
							placeholder='网站 URL'
							className='bg-neutral-50 flex-1 rounded-md border border-neutral-200 px-3 py-1.5 text-sm focus:outline-none focus:border-neutral-400'
						/>
						<input
							type='url'
							value={localProject.github || ''}
							onChange={e => handleFieldChange('github', e.target.value || undefined)}
							placeholder='GitHub URL（可选）'
							className='bg-neutral-50 flex-1 rounded-md border border-neutral-200 px-3 py-1.5 text-sm focus:outline-none focus:border-neutral-400'
						/>
						<input
							type='url'
							value={localProject.npm || ''}
							onChange={e => handleFieldChange('npm', e.target.value || undefined)}
							placeholder='NPM URL（可选）'
							className='bg-neutral-50 flex-1 rounded-md border border-neutral-200 px-3 py-1.5 text-sm focus:outline-none focus:border-neutral-400'
						/>
					</>
				) : (
					<>
						<Link
							href={localProject.url}
							target='_blank'
							rel='noopener noreferrer'
							className='flex items-center justify-center bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors shadow-sm'>
							Website
						</Link>
						{localProject.github && (
							<Link
								href={localProject.github}
								target='_blank'
								rel='noopener noreferrer'
								className='flex items-center justify-center bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors shadow-sm'>
								GitHub
							</Link>
						)}
						{localProject.npm && (
							<Link
								href={localProject.npm}
								target='_blank'
								rel='noopener noreferrer'
								className='flex items-center justify-center bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors shadow-sm'>
								NPM
							</Link>
						)}
					</>
				)}
			</div>

			{canEdit && showImageDialog && (
				<ImageUploadDialog currentImage={localProject.image} onClose={() => setShowImageDialog(false)} onSubmit={handleImageSubmit} />
			)}
		</motion.div>
	)
}
