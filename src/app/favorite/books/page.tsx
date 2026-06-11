'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import BookGridView from '../book-grid-view'
import BookCreateDialog from '../components/book-create-dialog'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { useAuthStore } from '@/hooks/use-auth'
import { pushBooks } from './services/push-books'
import { useRef } from 'react'

import initialBooks from '../books.json'
import initialCategories from '../categories.json'

import type { Book } from '../components/book-card'
import type { LogoItem } from '../components/logo-upload-dialog'

export default function FavoriteBooksPage() {
	const [books, setBooks] = useState<Book[]>(initialBooks as Book[])
	const [originalBooks, setOriginalBooks] = useState<Book[]>(initialBooks as Book[])
	const [categories, setCategories] = useState<string[]>(initialCategories as string[])
	const [originalCategories, setOriginalCategories] = useState<string[]>(initialCategories as string[])
	const [editingBook, setEditingBook] = useState<Book | null>(null)
	const [isBookDialogOpen, setIsBookDialogOpen] = useState(false)
	const keyInputRef = useRef<HTMLInputElement>(null)

	const { isAuth, setPrivateKey } = useAuthStore()

	const [isEditMode, setIsEditMode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [logoItems, setLogoItems] = useState<Map<string, LogoItem>>(new Map())

	const { siteContent } = useConfigStore()
	const hideEditButton = siteContent.hideEditButton ?? false

	const handleUpdateBook = (updatedBook: Book, oldBook: Book, logoItem?: LogoItem) => {
		setBooks(prev => prev.map(s => (s.name === oldBook.name ? updatedBook : s)))
		if (logoItem) {
			setLogoItems(prev => {
				const newMap = new Map(prev)
				newMap.set(updatedBook.name, logoItem)
				return newMap
			})
		}
	}

	const handleSaveBook = (updatedBook: Book) => {
		if (editingBook) {
			setBooks(books.map(s => (s.name === editingBook.name ? updatedBook : s)))
		} else {
			setBooks([...books, updatedBook])
		}
	}

	const handleDeleteBook = (book: Book) => {
		if (confirm(`确定要删除《${book.name}》吗？`)) {
			setBooks(books.filter(s => s.name !== book.name))
		}
	}

	const handleTogglePin = async (book: Book) => {
		const pinCount = books.filter(b => b.isPinned).length
		if (!book.isPinned && pinCount >= 5) {
			toast.error('最多只能置顶 5 个书籍')
			return
		}

		const updatedBook = { ...book, isPinned: !book.isPinned }
		const newBooks = books.map(s => (s.name === book.name ? updatedBook : s))
		setBooks(newBooks)
		setOriginalBooks(newBooks) // so cancelling edit doesn't revert pin

		// Silent save
		try {
			const res = await fetch('/api/save-data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target: 'books', data: newBooks }) })
			const data = await res.json()
			if (data.success) {
				toast.success(updatedBook.isPinned ? '已置顶' : '已取消置顶')
			}
		} catch (err) {
			console.error(err)
		}
	}

	const handleAddCategory = (newCategory: string) => {
		if (newCategory.trim() && !categories.includes(newCategory.trim())) {
			setCategories([...categories, newCategory.trim()])
		}
	}

	const handleDeleteCategory = (categoryToDelete: string) => {
		setCategories(categories.filter(c => c !== categoryToDelete))
	}

	const handleSaveLocal = async () => {
		setIsSaving(true)

		try {
			const promises = [
				fetch('/api/save-data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target: 'books', data: books }) }),
				fetch('/api/save-data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target: 'book-categories', data: categories }) })
			]

			const results = await Promise.all(promises)
			for (const res of results) {
				const data = await res.json()
				if (!data.success) throw new Error(data.error)
			}

			setOriginalBooks(books)
			setOriginalCategories(categories)
			setLogoItems(new Map())
			setIsEditMode(false)
			toast.success('本地保存成功！')
		} catch (error: any) {
			console.error('Failed to save:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleChoosePrivateKey = async (file: File) => {
		try {
			const text = await file.text()
			setPrivateKey(text)
			// 选择文件后自动保存到云端
			await handlePublishCloud()
		} catch (error) {
			console.error('Failed to read private key:', error)
			toast.error('读取密钥文件失败')
		}
	}

	const handlePublishCloudClick = () => {
		if (!isAuth) {
			keyInputRef.current?.click()
		} else {
			handlePublishCloud()
		}
	}

	const handlePublishCloud = async () => {
		setIsSaving(true)

		try {
			await pushBooks({
				books,
				categories,
				logoItems
			})

			setOriginalBooks(books)
			setOriginalCategories(categories)
			setLogoItems(new Map())
			setIsEditMode(false)
		} catch (error: any) {
			console.error('Failed to push:', error)
			toast.error(`云端发布失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleCancel = () => {
		setBooks(originalBooks)
		setCategories(originalCategories)
		setLogoItems(new Map())
		setIsEditMode(false)
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

	// Sort books: pinned first
	const sortedBooks = [...books].sort((a, b) => {
		if (a.isPinned && !b.isPinned) return -1
		if (!a.isPinned && b.isPinned) return 1
		return 0
	})

	return (
		<div className='min-h-screen relative pb-20'>
			<input
				ref={keyInputRef}
				type='file'
				accept='.pem'
				className='hidden'
				onChange={async e => {
					const f = e.target.files?.[0]
					if (f) await handleChoosePrivateKey(f)
					if (e.currentTarget) e.currentTarget.value = ''
				}}
			/>
			<div className='mx-auto w-full max-w-7xl px-6 pt-32 pb-8'>
				<Link href='/favorite' className='inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-6 text-sm font-medium'>
					<ArrowLeft className='w-4 h-4' /> Back to Favorites
				</Link>
				<div className='flex items-center justify-between mb-4'>
					<h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl font-serif text-neutral-900'>Books</h1>
					
					{/* Edit Controls in Header */}
					<div className='flex items-center gap-3'>
						{isEditMode ? (
							<>
								<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCancel} disabled={isSaving} className='rounded-full border bg-white px-4 py-2 text-sm shadow-sm'>
									取消
								</motion.button>
								<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setEditingBook(null); setIsBookDialogOpen(true); }} className='rounded-full border bg-white px-4 py-2 text-sm shadow-sm'>
									+ 添加
								</motion.button>
								<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSaveLocal} disabled={isSaving} className='rounded-full border bg-neutral-100 px-4 py-2 text-sm shadow-sm'>
									保存本地
								</motion.button>
								<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePublishCloudClick} disabled={isSaving} className='brand-btn px-6 py-2 rounded-full text-sm shadow-sm'>
									{isSaving ? '发布中...' : isAuth ? '发布云端' : '导入密钥'}
								</motion.button>
							</>
						) : (
							!hideEditButton && (
								<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsEditMode(true)} className='bg-white rounded-full border px-4 py-2 text-sm shadow-sm transition-colors hover:bg-neutral-50 font-medium text-neutral-700'>
									编辑模式
								</motion.button>
							)
						)}
					</div>
				</div>
			</div>

			<div>
				<BookGridView 
					books={sortedBooks} 
					categories={categories}
					isEditMode={isEditMode} 
					onUpdate={handleUpdateBook} 
					onDelete={handleDeleteBook}
					onAddCategory={handleAddCategory} 
					onDeleteCategory={handleDeleteCategory}
					onTogglePin={handleTogglePin}
				/>
			</div>

			{isBookDialogOpen && <BookCreateDialog bookList={books} books={editingBook} categories={categories} onClose={() => setIsBookDialogOpen(false)} onSave={handleSaveBook} />}
		</div>
	)
}
