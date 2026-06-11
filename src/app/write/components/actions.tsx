import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useWriteStore } from '../stores/write-store'
import { usePreviewStore } from '../stores/preview-store'
import { usePublish } from '../hooks/use-publish'
import { saveBlogLocal } from '../services/save-blog-local'
import { useAutoSave } from '../hooks/use-auto-save'

export function WriteActions() {
	const { loading, mode, form, loadBlogForEdit, originalSlug, updateForm, autoSaveStatus, isZenMode, isSplitMode, toggleZenMode, toggleSplitMode } = useWriteStore()
	const { openPreview } = usePreviewStore()
	const { isAuth, onChoosePrivateKey, onPublish, onDelete } = usePublish()
	const [saving, setSaving] = useState(false)
	
	// Enable auto-save
	useAutoSave()

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isZenMode) {
				toggleZenMode()
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [isZenMode, toggleZenMode])

	const keyInputRef = useRef<HTMLInputElement>(null)
	const mdInputRef = useRef<HTMLInputElement>(null)
	const router = useRouter()

	const handleImportOrPublish = () => {
		if (!isAuth) {
			keyInputRef.current?.click()
		} else {
			onPublish()
		}
	}

	const handleSaveLocal = async () => {
		try {
			setSaving(true)
			await saveBlogLocal({
				form: useWriteStore.getState().form,
				cover: useWriteStore.getState().cover,
				images: useWriteStore.getState().images,
				mode: useWriteStore.getState().mode,
				originalSlug: useWriteStore.getState().originalSlug
			})
			toast.success('本地保存成功')
			router.push('/blog')
		} catch (error: any) {
			console.error(error)
			toast.error(error.message || '本地保存失败')
		} finally {
			setSaving(false)
		}
	}

	const handleCancel = () => {
		if (!window.confirm('返回上一页？（未保存的修改会丢失）')) {
			return
		}
		if (mode === 'edit' && originalSlug) {
			router.push(`/blog/${originalSlug}`)
		} else {
			router.push('/blog')
		}
	}

	const buttonText = isAuth ? (mode === 'edit' ? '更新' : '发布') : '导入密钥'

	const handleImportMd = () => {
		mdInputRef.current?.click()
	}

	const handleMdFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		try {
			const text = await file.text()
			updateForm({ md: text })
			toast.success('已导入 Markdown 文件')
		} catch (error) {
			toast.error('导入失败，请重试')
		} finally {
			if (e.currentTarget) e.currentTarget.value = ''
		}
	}

	if (isZenMode) {
		return (
			<motion.button
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="fixed top-6 right-6 z-50 bg-card rounded-full shadow-lg border px-4 py-2 text-sm flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
				onClick={toggleZenMode}>
				退出禅模式 (Esc)
			</motion.button>
		)
	}

	return (
		<>
			<input
				ref={keyInputRef}
				type='file'
				accept='.pem'
				className='hidden'
				onChange={async e => {
					const f = e.target.files?.[0]
					if (f) await onChoosePrivateKey(f)
					if (e.currentTarget) e.currentTarget.value = ''
				}}
			/>
			<input ref={mdInputRef} type='file' accept='.md' className='hidden' onChange={handleMdFileChange} />

			<div className='flex items-center justify-between w-full z-40'>
				<div className='flex items-center gap-2'>
					<motion.button
						initial={{ opacity: 0, scale: 0.6 }}
						animate={{ opacity: 1, scale: 1 }}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={handleCancel}
						disabled={saving}
						className='bg-card rounded-xl border px-4 py-2 text-sm'>
						返回
					</motion.button>

					{mode === 'edit' && (
						<motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} className='flex items-center gap-2'>
							<div className='rounded-lg border bg-blue-50 px-4 py-2 text-sm text-blue-700'>编辑模式</div>
						</motion.div>
					)}
				</div>

				<div className='flex items-center gap-2'>
					<motion.button
						initial={{ opacity: 0, scale: 0.6 }}
						animate={{ opacity: 1, scale: 1 }}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className={`rounded-xl border px-4 py-2 text-sm ${isZenMode ? 'bg-brand text-white border-brand' : 'bg-card'}`}
						disabled={loading}
						onClick={toggleZenMode}>
						{isZenMode ? '退出禅模式' : '禅模式'}
					</motion.button>
					<motion.button
						initial={{ opacity: 0, scale: 0.6 }}
						animate={{ opacity: 1, scale: 1 }}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className={`rounded-xl border px-4 py-2 text-sm ${isSplitMode ? 'bg-brand text-white border-brand' : 'bg-card'}`}
						disabled={loading}
						onClick={toggleSplitMode}>
						{isSplitMode ? '退出分栏' : '分栏预览'}
					</motion.button>
					<motion.button
						initial={{ opacity: 0, scale: 0.6 }}
						animate={{ opacity: 1, scale: 1 }}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className='bg-card rounded-xl border px-4 py-2 text-sm'
						disabled={loading}
						onClick={handleImportMd}>
						导入 MD
					</motion.button>
					<motion.button
						initial={{ opacity: 0, scale: 0.6 }}
						animate={{ opacity: 1, scale: 1 }}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className='bg-card rounded-xl border px-6 py-2 text-sm'
						disabled={loading}
						onClick={openPreview}>
						全屏预览
					</motion.button>
					<motion.button
						initial={{ opacity: 0, scale: 0.6 }}
						animate={{ opacity: 1, scale: 1 }}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className='bg-card rounded-xl border px-6 py-2 text-sm flex items-center gap-2'
						disabled={loading || saving}
						onClick={handleSaveLocal}>
						<span>{saving ? '保存中...' : '本地保存'}</span>
						{autoSaveStatus === 'saving' && <span className="text-xs text-gray-400">自动保存中...</span>}
						{autoSaveStatus === 'saved' && !saving && <span className="text-xs text-green-500">✓ 已保存</span>}
					</motion.button>
					<motion.button
						initial={{ opacity: 0, scale: 0.6 }}
						animate={{ opacity: 1, scale: 1 }}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className='brand-btn px-6'
						disabled={loading || saving}
						onClick={handleImportOrPublish}>
						{buttonText}
					</motion.button>
				</div>
			</div>
		</>
	)
}
