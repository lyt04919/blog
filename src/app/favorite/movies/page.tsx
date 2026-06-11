'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import MovieGridView from '../movie-grid-view'
import MovieCreateDialog from '../components/movie-create-dialog'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { useAuthStore } from '@/hooks/use-auth'
import { pushMovies } from './services/push-movies'
import { useRef } from 'react'

import initialMovies from '../movies.json'

import type { Movie } from '../components/movie-card'
import type { LogoItem } from '../components/logo-upload-dialog'

export default function FavoriteMoviesPage() {
	const [movies, setMovies] = useState<Movie[]>(initialMovies as Movie[])
	const [originalMovies, setOriginalMovies] = useState<Movie[]>(initialMovies as Movie[])
	const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
	const [isMovieDialogOpen, setIsMovieDialogOpen] = useState(false)
	const keyInputRef = useRef<HTMLInputElement>(null)

	const { isAuth, setPrivateKey } = useAuthStore()

	const [isEditMode, setIsEditMode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [logoItems, setLogoItems] = useState<Map<string, LogoItem>>(new Map())

	const { siteContent } = useConfigStore()
	const hideEditButton = siteContent.hideEditButton ?? false

	const handleUpdateMovie = (updatedMovie: Movie, oldMovie: Movie, logoItem?: LogoItem) => {
		setMovies(prev => prev.map(s => (s.name === oldMovie.name ? updatedMovie : s)))
		if (logoItem) {
			setLogoItems(prev => {
				const newMap = new Map(prev)
				newMap.set(updatedMovie.name, logoItem)
				return newMap
			})
		}
	}

	const handleSaveMovie = (updatedMovie: Movie) => {
		if (editingMovie) {
			setMovies(movies.map(s => (s.name === editingMovie.name ? updatedMovie : s)))
		} else {
			setMovies([...movies, updatedMovie])
		}
	}

	const handleDeleteMovie = (movie: Movie) => {
		if (confirm(`确定要删除《${movie.name}》吗？`)) {
			setMovies(movies.filter(s => s.name !== movie.name))
		}
	}

	const handleTogglePin = async (movie: Movie) => {
		const pinCount = movies.filter(m => m.isPinned).length
		if (!movie.isPinned && pinCount >= 5) {
			toast.error('最多只能置顶 5 个电影')
			return
		}

		const updatedMovie = { ...movie, isPinned: !movie.isPinned }
		const newMovies = movies.map(s => (s.name === movie.name ? updatedMovie : s))
		setMovies(newMovies)
		setOriginalMovies(newMovies) // so cancelling edit doesn't revert pin

		// Silent save
		try {
			const res = await fetch('/api/save-data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target: 'movies', data: newMovies }) })
			const data = await res.json()
			if (data.success) {
				toast.success(updatedMovie.isPinned ? '已置顶' : '已取消置顶')
			}
		} catch (err) {
			console.error(err)
		}
	}

	const handleSaveLocal = async () => {
		setIsSaving(true)

		try {
			const res = await fetch('/api/save-data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target: 'movies', data: movies }) })
			const data = await res.json()
			if (!data.success) throw new Error(data.error)

			setOriginalMovies(movies)
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
			await pushMovies({
				movies,
				categories: [], // Assuming categories is handled separately or not at all for movies right now
				logoItems
			})

			setOriginalMovies(movies)
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
		setMovies(originalMovies)
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

	// Sort movies: pinned first
	const sortedMovies = [...movies].sort((a, b) => {
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
					<h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl font-serif text-neutral-900'>Movies</h1>
					
					{/* Edit Controls in Header */}
					<div className='flex items-center gap-3'>
						{isEditMode ? (
							<>
								<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCancel} disabled={isSaving} className='rounded-full border bg-white px-4 py-2 text-sm shadow-sm'>
									取消
								</motion.button>
								<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setEditingMovie(null); setIsMovieDialogOpen(true); }} className='rounded-full border bg-white px-4 py-2 text-sm shadow-sm'>
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
				<MovieGridView 
					movies={sortedMovies} 
					isEditMode={isEditMode} 
					onUpdate={handleUpdateMovie} 
					onDelete={handleDeleteMovie} 
					onTogglePin={handleTogglePin}
				/>
			</div>

			{isMovieDialogOpen && <MovieCreateDialog movieList={movies} movies={editingMovie} onClose={() => setIsMovieDialogOpen(false)} onSave={handleSaveMovie} />}
		</div>
	)
}
