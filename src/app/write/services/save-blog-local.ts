import { fileToBase64NoPrefix, hashFileSHA256 } from '@/lib/file-utils'
import type { ImageItem } from '../types'
import { getFileExt } from '@/lib/utils'
import { toast } from 'sonner'

export type SaveBlogLocalParams = {
	form: {
		slug: string
		title: string
		md: string
		tags: string[]
		date?: string
		summary?: string
		hidden?: boolean
		category?: string
	}
	cover?: ImageItem | null
	images?: ImageItem[]
	mode?: 'create' | 'edit'
	originalSlug?: string | null
}

export async function saveBlogLocal(params: SaveBlogLocalParams): Promise<void> {
	const { form, cover, images, mode = 'create', originalSlug } = params

	if (!form?.slug) throw new Error('需要 slug')

	if (mode === 'edit' && originalSlug && originalSlug !== form.slug) {
		throw new Error('编辑模式下不支持修改 slug，请保持原 slug 不变')
	}

	const allLocalImages: Array<{ img: Extract<ImageItem, { type: 'file' }>; id: string }> = []

	for (const img of images || []) {
		if (img.type === 'file') {
			allLocalImages.push({ img, id: img.id })
		}
	}

	if (cover?.type === 'file') {
		allLocalImages.push({ img: cover, id: cover.id })
	}

	toast.info('正在处理图片并保存...')

	const uploadedHashes = new Set<string>()
	let mdToUpload = form.md
	let coverPath: string | undefined

	const apiImages: { path: string; contentBase64: string }[] = []

	if (allLocalImages.length > 0) {
		for (const { img, id } of allLocalImages) {
			const hash = img.hash || (await hashFileSHA256(img.file))
			const ext = getFileExt(img.file.name)
			const filename = `${hash}${ext}`
			const publicPath = `/blogs/${form.slug}/${filename}`

			if (!uploadedHashes.has(hash)) {
				const path = `public/blogs/${form.slug}/${filename}`
				const contentBase64 = await fileToBase64NoPrefix(img.file)
				apiImages.push({ path, contentBase64 })
				uploadedHashes.add(hash)
			}

			const placeholder = `local-image:${id}`
			mdToUpload = mdToUpload.split(`(${placeholder})`).join(`(${publicPath})`)

			if (cover?.type === 'file' && cover.id === id) {
				coverPath = publicPath
			}
		}
	}

	if (cover?.type === 'url') {
		coverPath = cover.url
	}

	const config = {
		title: form.title,
		tags: form.tags,
		date: form.date,
		summary: form.summary,
		cover: coverPath,
		hidden: form.hidden,
		category: form.category
	}

	const res = await fetch('/api/save-blog-local', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			slug: form.slug,
			md: mdToUpload,
			config,
			images: apiImages
		})
	})

	const data = await res.json()
	if (!data.success) {
		throw new Error(data.error || '保存失败')
	}

	toast.success('本地保存成功！')
}
