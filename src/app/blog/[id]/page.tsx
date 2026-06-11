'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import { motion } from 'motion/react'
import { BlogPreview } from '@/components/blog-preview'
import { loadBlog, type BlogConfig } from '@/lib/load-blog'
import { useReadArticles } from '@/hooks/use-read-articles'
import LiquidGrass from '@/components/liquid-grass'
import { ArrowLeft } from 'lucide-react'

export default function Page() {
	const params = useParams() as { id?: string | string[] }
	const slug = Array.isArray(params?.id) ? params.id[0] : params?.id || ''
	const router = useRouter()
	const { markAsRead } = useReadArticles()

	const [blog, setBlog] = useState<{ config: BlogConfig; markdown: string; cover?: string } | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState<boolean>(true)

	useEffect(() => {
		let cancelled = false
		async function run() {
			if (!slug) return
			try {
				setLoading(true)
				const blogData = await loadBlog(slug)

				if (!cancelled) {
					setBlog(blogData)
					setError(null)
					markAsRead(slug)
				}
			} catch (e: any) {
				if (!cancelled) setError(e?.message || '加载失败')
			} finally {
				if (!cancelled) setLoading(false)
			}
		}
		run()
		return () => {
			cancelled = true
		}
	}, [slug, markAsRead])

	const title = useMemo(() => (blog?.config.title ? blog.config.title : slug), [blog?.config.title, slug])
	const date = useMemo(() => dayjs(blog?.config.date).format('YYYY年 M月 D日'), [blog?.config.date])
	const tags = blog?.config.tags || []

	const handleEdit = () => {
		router.push(`/write/${slug}`)
	}

	const handleBack = () => {
		if (window.history.length > 1) {
			router.back()
		} else {
			router.push('/blog')
		}
	}

	if (!slug) {
		return <div className='text-secondary flex h-full items-center justify-center text-sm'>无效的链接</div>
	}

	if (loading) {
		return <div className='text-secondary flex h-full items-center justify-center text-sm'>加载中...</div>
	}

	if (error) {
		return <div className='flex h-full items-center justify-center text-sm text-red-500'>{error}</div>
	}

	if (!blog) {
		return <div className='text-secondary flex h-full items-center justify-center text-sm'>文章不存在</div>
	}

	return (
		<>
			<motion.button
				initial={{ opacity: 0, scale: 0.6 }}
				animate={{ opacity: 1, scale: 1 }}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				onClick={handleBack}
				className='absolute left-6 rounded-xl border bg-white/60 px-4 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-white/80 flex items-center gap-1.5 z-40 max-sm:left-4'
				style={{ top: '6rem' }}>
				<ArrowLeft className='h-4 w-4' />
				返回
			</motion.button>

			<BlogPreview
				markdown={blog.markdown}
				title={title}
				tags={tags}
				date={date}
				summary={blog.config.summary}
				cover={blog.cover ? (blog.cover.startsWith('http') ? blog.cover : `${origin}${blog.cover}`) : undefined}
				slug={slug}
			/>

			<motion.button
				initial={{ opacity: 0, scale: 0.6 }}
				animate={{ opacity: 1, scale: 1 }}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				onClick={handleEdit}
				className='absolute right-6 rounded-xl border bg-white/60 px-6 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-white/80 max-sm:hidden z-40' style={{ top: '6rem' }}>
				编辑
			</motion.button>

			{slug === 'liquid-grass' && <LiquidGrass />}
		</>
	)
}
