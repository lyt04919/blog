'use client'

import { useState } from 'react'

import { type LogoItem } from './components/logo-upload-dialog'
import { BookCard, type Book } from './components/book-card'
import { cn } from '@/lib/utils'

interface GridViewProps {
	books: Book[]
	categories?: string[]
	isEditMode?: boolean
	onUpdate?: (updatedBook: Book, oldBook: Book, logoItem?: LogoItem) => void
	onDelete?: (book: Book) => void
	onAddCategory?: (category: string) => void
	onDeleteCategory?: (category: string) => void
	onTogglePin?: (book: Book) => void
}

export default function GridView({ books, categories = [], isEditMode = false, onUpdate, onDelete, onAddCategory, onDeleteCategory, onTogglePin }: GridViewProps) {
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedTag, setSelectedTag] = useState<string>('all')

	const allTags = categories.length > 0 ? categories : Array.from(new Set(books.flatMap(book => book.tags)))

	const getTagCount = (tag: string) => {
		if (tag === 'all') return books.length
		return books.filter(b => b.tags.includes(tag)).length
	}

	const filteredBooks = books.filter(book => {
		const matchesSearch = book.name.toLowerCase().includes(searchTerm.toLowerCase()) || book.description.toLowerCase().includes(searchTerm.toLowerCase())
		const matchesTag = selectedTag === 'all' || book.tags.includes(selectedTag)
		return matchesSearch && matchesTag
	})

	return (
		<div className='mx-auto w-full max-w-7xl px-6 pb-12'>
			<div className='mb-12 flex flex-wrap items-center border-b border-transparent' style={{ gap: '3rem' }}>
				<button
					onClick={() => setSelectedTag('all')}
					className={cn(
						'text-lg font-medium pb-1 transition-colors relative',
						selectedTag === 'all' ? 'text-primary after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[2px] after:bg-primary' : 'text-secondary hover:text-primary'
					)}>
					All<sup className='ml-0.5 text-xs font-normal'>{books.length}</sup>
				</button>
				{allTags.map((tag: string) => (
					<div key={tag} className='group relative flex items-center'>
						<button
							onClick={() => setSelectedTag(tag)}
							className={cn(
								'text-lg font-medium pb-1 transition-colors relative',
								selectedTag === tag ? 'text-primary after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[2px] after:bg-primary' : 'text-secondary hover:text-primary'
							)}>
							{tag}<sup className='ml-0.5 text-xs font-normal'>{getTagCount(tag)}</sup>
						</button>
						{isEditMode && (
							<button
								onClick={(e) => {
									e.stopPropagation()
									if (confirm(`确定要删除题材 "${tag}" 吗？该操作不会删除所属书籍。`)) {
										if (onDeleteCategory) onDeleteCategory(tag)
									}
								}}
								className='ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-100 text-[10px] text-red-500 opacity-0 transition-opacity hover:bg-red-200 group-hover:opacity-100'
								title='删除题材'>
								✕
							</button>
						)}
					</div>
				))}
				{isEditMode && (
					<button
						onClick={() => {
							const newTag = prompt('请输入新题材名称：')
							if (newTag && onAddCategory) onAddCategory(newTag)
						}}
						className='text-sm text-brand border border-brand/30 rounded-full px-3 py-1 hover:bg-brand/10 transition-colors ml-4'>
						+ 新增题材
					</button>
				)}
			</div>

			<div className='grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4'>
				{filteredBooks.map((book: Book) => (
					<BookCard key={book.name} book={book} categories={allTags} isEditMode={isEditMode} onUpdate={onUpdate} onDelete={() => onDelete?.(book)} onTogglePin={onTogglePin} />
				))}
			</div>

			{filteredBooks.length === 0 && (
				<div className='mt-12 text-center text-gray-500'>
					<p>没有找到相关资源</p>
				</div>
			)}
		</div>
	)
}
