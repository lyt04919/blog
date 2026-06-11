'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Search, Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useAuthStore } from '@/hooks/use-auth'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { FavoriteItemCard, type FavoriteItem } from './favorite-item-card'
import { FavoriteItemCreateDialog } from './favorite-item-create-dialog'

interface FavoriteItemPageTemplateProps {
	initialItems: FavoriteItem[]
	targetType: 'gears' | 'software' | 'music' | 'games' | 'videos'
	pageTitle: string
	pageDescription: string
}

export function FavoriteItemPageTemplate({
	initialItems,
	targetType,
	pageTitle,
	pageDescription
}: FavoriteItemPageTemplateProps) {
	const [items, setItems] = useState<FavoriteItem[]>(initialItems)
	const [searchQuery, setSearchQuery] = useState('')
	const [activeCategory, setActiveCategory] = useState('All')
	const [isCreateOpen, setIsCreateOpen] = useState(false)
	const [isEditMode, setIsEditMode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

	const { isAuth } = useAuthStore()
	const { siteContent } = useConfigStore()
	const hideEditButton = siteContent.hideEditButton ?? false

	// Extract unique categories from items dynamically
	const categories = useMemo(() => {
		const cats = new Set<string>()
		items.forEach(item => {
			if (item.category?.trim()) cats.add(item.category.trim())
		})
		return ['All', ...Array.from(cats)]
	}, [items])

	// Filter and sort items (pinned items first, then match search and category)
	const filteredItems = useMemo(() => {
		let result = [...items]

		// Category filter
		if (activeCategory !== 'All') {
			result = result.filter(item => item.category?.trim() === activeCategory)
		}

		// Search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim()
			result = result.filter(
				item =>
					item.name.toLowerCase().includes(query) ||
					item.desc.toLowerCase().includes(query) ||
					item.subtitle?.toLowerCase().includes(query) ||
					item.category?.toLowerCase().includes(query)
			)
		}

		// Sort: pinned first, then normal order
		return result.sort((a, b) => {
			if (a.isPinned && !b.isPinned) return -1
			if (!a.isPinned && b.isPinned) return 1
			return 0
		})
	}, [items, activeCategory, searchQuery])

	// Save modified items list back to server
	const saveItemsList = async (updatedItems: FavoriteItem[]) => {
		try {
			setIsSaving(true)
			const res = await fetch('/api/save-data', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ target: targetType, data: updatedItems })
			})
			const data = await res.json()
			if (data.success) {
				toast.success('配置已保存！')
			} else {
				throw new Error(data.error || 'Failed to save')
			}
		} catch (err: any) {
			toast.error(`保存失败: ${err?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleAdd = (newItem: FavoriteItem) => {
		const updated = [newItem, ...items]
		setItems(updated)
		setIsCreateOpen(false)
		saveItemsList(updated)
	}

	const handleUpdate = (updatedItem: FavoriteItem, oldItem: FavoriteItem) => {
		const updated = items.map(it => (it.name === oldItem.name ? updatedItem : it))
		setItems(updated)
		saveItemsList(updated)
	}

	const handleDelete = (itemToDelete: FavoriteItem) => {
		if (confirm(`确定要删除“${itemToDelete.name}”吗？`)) {
			const updated = items.filter(it => it.name !== itemToDelete.name)
			setItems(updated)
			saveItemsList(updated)
		}
	}

	const handleTogglePin = (itemToPin: FavoriteItem) => {
		// Limit pinned items count to 5
		const pinCount = items.filter(it => it.isPinned).length
		if (!itemToPin.isPinned && pinCount >= 5) {
			toast.error('最多只能置顶 5 个项目')
			return
		}

		const updatedItem = { ...itemToPin, isPinned: !itemToPin.isPinned }
		const updated = items.map(it => (it.name === itemToPin.name ? updatedItem : it))
		setItems(updated)
		saveItemsList(updated)
	}

	return (
		<div className='min-h-screen relative pb-32 bg-bg'>
			{/* Top Hero Section */}
			<div className='mx-auto w-full max-w-7xl px-6 pt-32 pb-8'>
				<div className='flex items-center gap-2 mb-4'>
					<Link
						href='/favorite'
						className='flex h-9 w-9 items-center justify-center rounded-full bg-white/60 dark:bg-neutral-800/60 border hover:scale-105 active:scale-95 transition-all text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
					>
						<ArrowLeft className='w-4 h-4' />
					</Link>
					<span className='text-xs text-neutral-400 font-semibold tracking-widest uppercase'>Favorites</span>
				</div>

				<div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
					<div>
						<h1 className='text-3xl font-extrabold tracking-tight lg:text-4xl mb-2 font-serif text-neutral-900 dark:text-white'>
							{pageTitle}
						</h1>
						<p className='text-neutral-500 text-sm max-w-xl'>
							{pageDescription}
						</p>
					</div>

					{/* Admin Actions */}
					{!hideEditButton && (
						<div className='flex gap-3'>
							<button
								onClick={() => setIsEditMode(!isEditMode)}
								className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
									isEditMode
										? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-black shadow-md'
										: 'bg-white/60 hover:bg-white/90 text-neutral-700 dark:bg-neutral-800/60 dark:hover:bg-neutral-800/90 dark:text-neutral-300'
								}`}
							>
								{isEditMode ? '退出管理' : '管理数据'}
							</button>
							{isEditMode && (
								<button
									onClick={() => setIsCreateOpen(true)}
									className='flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-brand text-white hover:opacity-90 active:scale-95 transition-all shadow'
								>
									<Plus className='w-3.5 h-3.5' /> 新增数据
								</button>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Filter & Search Bar */}
			<div className='mx-auto w-full max-w-7xl px-6 mb-8 space-y-4'>
				{/* Search box */}
				<input
					type='text'
					placeholder='搜索名称或描述...'
					value={searchQuery}
					onChange={e => setSearchQuery(e.target.value)}
					className='focus:ring-brand mx-auto block w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none text-xs text-neutral-700 dark:text-neutral-300 dark:bg-neutral-800 dark:border-neutral-700'
				/>

				{/* Categories */}
				<div className='flex flex-wrap justify-center gap-2'>
					{categories.map(cat => (
						<button
							key={cat}
							onClick={() => setActiveCategory(cat)}
							className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
								activeCategory === cat
									? 'bg-brand text-white'
									: 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
							}`}
						>
							{cat === 'All' ? '全部' : cat}
						</button>
					))}
				</div>
			</div>

			{/* Main Grid View */}
			<div className='mx-auto w-full max-w-7xl px-6'>
				{filteredItems.length === 0 ? (
					<div className='text-center py-20 bg-white/20 dark:bg-neutral-800/10 rounded-[32px] border border-dashed border-neutral-300/60 dark:border-neutral-700/60'>
						<Sparkles className='w-8 h-8 text-neutral-300 mx-auto mb-3' />
						<p className='text-xs text-neutral-400'>没有找到匹配的内容哦</p>
					</div>
				) : (
					<div
						className={`grid gap-6 ${
							targetType === 'videos'
								? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
								: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
						}`}
					>
						{filteredItems.map((item, idx) => (
							<FavoriteItemCard
								key={`${item.name}-${idx}`}
								item={item}
								targetType={targetType}
								isEditMode={isEditMode}
								onUpdate={handleUpdate}
								onDelete={() => handleDelete(item)}
								onTogglePin={handleTogglePin}
							/>
						))}
					</div>
				)}
			</div>

			{/* Create Dialog Overlay */}
			{isCreateOpen && (
				<FavoriteItemCreateDialog
					targetType={targetType}
					onClose={() => setIsCreateOpen(false)}
					onSave={handleAdd}
				/>
			)}
		</div>
	)
}
