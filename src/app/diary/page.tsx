'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'sonner'
import TimelineView from './timeline-view'
import CreateDialog from './components/create-dialog'
import { pushDiaries } from './services/push-diaries'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import initialList from './list.json'
import type { ImageItem } from '@/app/projects/components/image-upload-dialog'
import type { Diary } from './components/diary-card'
import dayjs from 'dayjs'

import { LayoutGrid, Calendar as CalendarIcon, List, Search, Filter, ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react'
import DiaryCalendar from './components/diary-calendar'
import ChangelogView from './changelog-view'
import OnThisDay from './components/on-this-day'
import DiaryFilterPanel from './components/diary-filter-panel'

export default function Page() {
	const [diaries, setDiaries] = useState<Diary[]>(initialList as Diary[])
	const [originalDiaries, setOriginalDiaries] = useState<Diary[]>(initialList as Diary[])
	const [isEditMode, setIsEditMode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [editingDiary, setEditingDiary] = useState<Diary | null>(null)
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [imageItems, setImageItems] = useState<Map<string, ImageItem>>(new Map())

	const [viewMode, setViewMode] = useState<'grid' | 'calendar' | 'changelog'>('grid')
	const [searchQuery, setSearchQuery] = useState('')
	const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
	const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
	const [filters, setFilters] = useState<import('./components/diary-filter-panel').FilterState>({
		year: null,
		month: null,
		tags: [],
		locations: [],
		moods: [],
		weathers: [],
		mediaType: 'all'
	})

	const { siteContent } = useConfigStore()
	const hideEditButton = siteContent.hideEditButton ?? false

	const [quickContent, setQuickContent] = useState('')

	const filteredDiaries = useMemo(() => {
		const filtered = diaries.filter(d => {
			const q = searchQuery.toLowerCase()
			const matchesSearch = !q || 
				(d.content && d.content.toLowerCase().includes(q)) || 
				(d.tags && d.tags.some(t => t.toLowerCase().includes(q))) || 
				(d.location && d.location.toLowerCase().includes(q))
			
			if (!matchesSearch) return false

			// Year and Month
			if (filters.year) {
				const date = dayjs(d.date)
				if (date.format('YYYY') !== filters.year) return false
				if (filters.month && date.format('MM') !== filters.month) return false
			}

			// Array filters (OR within the same category)
			if (filters.tags.length > 0 && (!d.tags || !filters.tags.some(t => d.tags!.includes(t)))) return false
			if (filters.locations.length > 0 && (!d.location || !filters.locations.includes(d.location))) return false
			if (filters.moods.length > 0 && (!d.mood || !filters.moods.includes(d.mood))) return false
			if (filters.weathers.length > 0 && (!d.weather || !filters.weathers.includes(d.weather))) return false

			// Media Type
			if (filters.mediaType !== 'all') {
				const hasMedia = (d.media && d.media.length > 0) || !!d.image
				if (filters.mediaType === 'media-only' && !hasMedia) return false
				if (filters.mediaType === 'text-only' && hasMedia) return false
			}
			
			return true
		})

		// Sort
		return filtered.sort((a, b) => {
			const dateA = dayjs(a.date).valueOf()
			const dateB = dayjs(b.date).valueOf()
			// Fallback to ID if dates are the same
			if (dateA === dateB) {
				return sortOrder === 'desc' 
					? parseInt(b.id) - parseInt(a.id)
					: parseInt(a.id) - parseInt(b.id)
			}
			return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
		})
	}, [diaries, searchQuery, filters, sortOrder])

	const activeFilterCount = 
		(filters.year ? 1 : 0) + 
		(filters.month ? 1 : 0) + 
		filters.tags.length + 
		filters.locations.length + 
		filters.moods.length + 
		filters.weathers.length + 
		(filters.mediaType !== 'all' ? 1 : 0)

	const handleUpdate = (updatedDiary: Diary, oldDiary: Diary, imageItem?: any) => {
		setDiaries(prev => prev.map(s => (s.id === oldDiary.id ? updatedDiary : s)))
		if (imageItem) {
			setImageItems(prev => {
				const newMap = new Map(prev)
				newMap.set(updatedDiary.id, imageItem)
				return newMap
			})
		}
	}

	const handleAdd = () => {
		setEditingDiary(null)
		setIsCreateDialogOpen(true)
	}

	const handleQuickAdd = () => {
		if (!quickContent.trim()) return
		const newDiary: Diary = {
			id: Date.now().toString(),
			date: dayjs().format('YYYY-MM-DD'),
			content: quickContent
		}
		setDiaries([newDiary, ...diaries])
		setQuickContent('')
		toast.success('记录成功')
	}

	const handleSaveDiary = (updatedDiary: Diary) => {
		if (editingDiary) {
			const updated = diaries.map(s => (s.id === editingDiary.id ? updatedDiary : s))
			setDiaries(updated)
		} else {
			setDiaries([updatedDiary, ...diaries])
		}
	}

	const handleDelete = (diary: Diary) => {
		if (confirm(`确定要删除这篇日记吗？`)) {
			setDiaries(diaries.filter(s => s.id !== diary.id))
		}
	}

	const handleSave = async () => {
		setIsSaving(true)

		try {
			await pushDiaries({
				diaries,
				imageItems
			})

			setOriginalDiaries(diaries)
			setImageItems(new Map())
			setIsEditMode(false)
			toast.success('保存成功！')
		} catch (error: any) {
			console.error('Failed to save:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleExitEditMode = () => {
		if (diaries !== originalDiaries) {
			handleSave()
		} else {
			setIsEditMode(false)
		}
	}

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isEditMode && (e.ctrlKey || e.metaKey) && e.key === ',') {
				e.preventDefault()
				setIsEditMode(true)
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [isEditMode])

	return (
		<div className='relative min-h-screen px-4 pb-20 pt-16 md:px-8 max-w-4xl mx-auto'>
			
			<OnThisDay diaries={diaries} />

			<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4'>
				{/* Search & Filters */}
				<div className='flex items-center gap-2 flex-1 w-full max-w-xl'>
					<div className='relative flex-1'>
						<Search className='absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400' />
						<input 
							type="text"
							placeholder="搜索回忆、地点、标签..."
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							className='w-full bg-white border border-neutral-200 rounded-full px-9 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all shadow-sm'
						/>
					</div>
					
					<button 
						onClick={() => setIsFilterPanelOpen(true)}
						className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm ${
							activeFilterCount > 0 
								? 'bg-neutral-900 text-white border-transparent' 
								: 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
						}`}
					>
						<Filter className="w-4 h-4" />
						<span className="max-sm:hidden">高级筛选</span>
						{activeFilterCount > 0 && (
							<span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[11px] font-bold text-white ml-0.5">
								{activeFilterCount}
							</span>
						)}
					</button>

					<button
						onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
						className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-neutral-200 text-neutral-600 text-sm font-medium hover:bg-neutral-50 hover:text-neutral-900 transition-all shadow-sm"
						title={sortOrder === 'desc' ? '当前：按时间倒序（最新优先）' : '当前：按时间正序（最旧优先）'}
					>
						{sortOrder === 'desc' ? <ArrowDownWideNarrow className="w-4 h-4" /> : <ArrowUpNarrowWide className="w-4 h-4" />}
						<span className="max-sm:hidden">{sortOrder === 'desc' ? '最新' : '最旧'}</span>
					</button>
				</div>

				{/* View Mode Toggle */}
				<div className='flex items-center gap-1 bg-neutral-100 p-1 rounded-full shrink-0'>
					<button
						onClick={() => setViewMode('grid')}
						className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
							viewMode === 'grid' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'
						}`}
					>
						<LayoutGrid className='w-4 h-4' />
						卡片
					</button>
					<button
						onClick={() => setViewMode('calendar')}
						className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
							viewMode === 'calendar' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'
						}`}
					>
						<CalendarIcon className='w-4 h-4' />
						日历
					</button>
					<button
						onClick={() => setViewMode('changelog')}
						className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
							viewMode === 'changelog' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'
						}`}
					>
						<List className='w-4 h-4' />
						时间轴
					</button>
				</div>
			</div>

			{viewMode === 'grid' && (
				<TimelineView diaries={filteredDiaries} isEditMode={isEditMode} onUpdate={handleUpdate} onDelete={handleDelete} />
			)}
			{viewMode === 'calendar' && (
				<DiaryCalendar diaries={filteredDiaries} isEditMode={isEditMode} onUpdate={handleUpdate} onDelete={handleDelete} />
			)}
			{viewMode === 'changelog' && (
				<ChangelogView diaries={filteredDiaries} isEditMode={isEditMode} onUpdate={handleUpdate} onDelete={handleDelete} />
			)}

			<motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} className='fixed bottom-24 left-8 z-50 flex flex-col sm:flex-row gap-3 max-sm:hidden'>
				{isEditMode ? (
					<>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleExitEditMode}
							disabled={isSaving}
							className='rounded-full border border-neutral-200 bg-white/90 backdrop-blur shadow-lg px-6 py-3 text-sm font-bold text-neutral-600 transition-colors hover:text-neutral-900'>
							完成编辑
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleAdd}
							className='rounded-full border border-neutral-200 bg-white/90 backdrop-blur shadow-lg px-6 py-3 text-sm font-bold text-neutral-600 transition-colors hover:text-neutral-900'>
							+ 添加日记
						</motion.button>
						<motion.button 
							whileHover={{ scale: 1.05 }} 
							whileTap={{ scale: 0.95 }} 
							onClick={handleSave} 
							disabled={isSaving} 
							className='rounded-full bg-neutral-900 text-white shadow-lg px-8 py-3 text-sm font-bold transition-colors hover:bg-neutral-800'
						>
							{isSaving ? '保存中...' : '保存'}
						</motion.button>
					</>
				) : (
					!hideEditButton && (
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setIsEditMode(true)}
							className='rounded-full border border-neutral-200 bg-white/90 backdrop-blur shadow-lg px-6 py-3 text-sm font-bold text-neutral-600 transition-colors hover:text-neutral-900 hover:border-neutral-300'>
							编辑模式
						</motion.button>
					)
				)}
			</motion.div>

			{isCreateDialogOpen && <CreateDialog diary={editingDiary} onClose={() => setIsCreateDialogOpen(false)} onSave={handleSaveDiary} />}

			<DiaryFilterPanel
				isOpen={isFilterPanelOpen}
				onClose={() => setIsFilterPanelOpen(false)}
				diaries={diaries}
				filteredCount={filteredDiaries.length}
				filters={filters}
				setFilters={setFilters}
			/>
		</div>
	)
}
