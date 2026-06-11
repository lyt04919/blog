'use client'

import { useRef } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { useWriteStore } from '../../stores/write-store'

type CoverSectionProps = {
	delay?: number
}

export function CoverSection({ delay = 0 }: CoverSectionProps) {
	const { images, setCover, cover, addFiles } = useWriteStore()
	const fileInputRef = useRef<HTMLInputElement>(null)

	const coverPreviewUrl = cover ? (cover.type === 'url' ? cover.url : cover.previewUrl) : null

	const handleCoverDrop = async (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()

		// 处理从图片列表中拖入的情况
		const md = e.dataTransfer.getData('text/markdown') || e.dataTransfer.getData('text/plain') || ''
		const m = /!\[\]\(([^)]+)\)/.exec(md.trim())
		if (m) {
			const target = m[1]
			let foundItem

			if (target.startsWith('local-image:')) {
				const id = target.replace(/^local-image:/, '')
				foundItem = images.find(it => it.id === id)
			} else {
				foundItem = images.find(it => it.type === 'url' && it.url === target)
			}

			if (foundItem) {
				setCover(foundItem)
				toast.success('已设置封面')

				return
			}
		}

		// 处理直接拖入文件的情况
		const files = e.dataTransfer.files
		if (files && files.length > 0) {
			const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
			if (imageFiles.length === 0) {
				toast.error('请拖入图片文件')
				return
			}

			const resultImages = await addFiles(imageFiles as unknown as FileList)
			if (resultImages && resultImages.length > 0) {
				// 使用第一个图片作为封面
				setCover(resultImages[0])
				toast.success('已设置封面')
			}
			return
		}
	}

	const handleClickUpload = () => {
		fileInputRef.current?.click()
	}

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files
		if (!files || files.length === 0) return

		const resultImages = await addFiles(files)
		if (resultImages && resultImages.length > 0) {
			// 使用第一个图片作为封面
			setCover(resultImages[0])
			toast.success('已设置封面')
		}

		// 重置 input 以便可以选择相同的文件
		e.target.value = ''
	}

	const handleRandomCover = () => {
		const seed = Math.random().toString(36).slice(2, 10)
		const imageUrl = `https://picsum.photos/seed/${seed}/1200/800`
		setCover({
			id: seed,
			type: 'url',
			url: imageUrl
		})
		toast.success('已随机生成封面')
	}

	return (
		<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay }} className='card relative'>
			<div className='flex items-center justify-between'>
				<h2 className='text-sm'>封面</h2>
				<div className='flex gap-3'>
					<button
						type='button'
						onClick={handleRandomCover}
						className='text-xs text-brand hover:underline transition-colors'>
						随机封面
					</button>
					{cover && (
						<button
							type='button'
							onClick={() => setCover(null)}
							className='text-xs text-red-500 hover:underline transition-colors'>
							清除
						</button>
					)}
				</div>
			</div>
			<input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={handleFileChange} />
			<div
				className='bg-card mt-3 h-[150px] overflow-hidden rounded-xl border'
				onDragOver={e => {
					e.preventDefault()
				}}
				onDrop={handleCoverDrop}>
				{!!coverPreviewUrl ? (
					<img src={coverPreviewUrl} alt='cover preview' className='h-full w-full rounded-2xl object-cover' />
				) : (
					<div className='grid h-full w-full cursor-pointer place-items-center transition-colors hover:bg-white/60' onClick={handleClickUpload}>
						<span className='text-3xl leading-none text-neutral-400'>+</span>
					</div>
				)}
			</div>
		</motion.div>
	)
}
