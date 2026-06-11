'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import GridView from './grid-view'
import CreateDialog from './components/create-dialog'
import { pushShares } from './services/push-shares'
import { useAuthStore } from '@/hooks/use-auth'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import initialList from './list.json'
import type { Share } from './components/share-card'
import type { LogoItem } from './components/logo-upload-dialog'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function Page() {
	const [shares, setShares] = useState<Share[]>(initialList as Share[])
	const [originalShares, setOriginalShares] = useState<Share[]>(initialList as Share[])
	const [isEditMode, setIsEditMode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [editingShare, setEditingShare] = useState<Share | null>(null)
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [logoItems, setLogoItems] = useState<Map<string, LogoItem>>(new Map())
	const keyInputRef = useRef<HTMLInputElement>(null)

	const { isAuth, setPrivateKey } = useAuthStore()
	const { siteContent } = useConfigStore()
	const hideEditButton = siteContent.hideEditButton ?? false

	const handleUpdate = (updatedShare: Share, oldShare: Share, logoItem?: LogoItem) => {
		if (updatedShare.isShow && !oldShare.isShow) {
			const showCount = shares.filter(s => s.isShow && s.url !== updatedShare.url).length
			if (showCount >= 4) {
				toast.error('主页最多只能展示 4 个，请先取消其他的展示勾选！')
				return
			}
		}

		setShares(prev => prev.map(s => (s.url === oldShare.url ? updatedShare : s)))
		if (logoItem) {
			setLogoItems(prev => {
				const newMap = new Map(prev)
				newMap.set(updatedShare.url, logoItem)
				return newMap
			})
		}
	}

	const handleAdd = () => {
		setEditingShare(null)
		setIsCreateDialogOpen(true)
	}

	const handleSaveShare = (updatedShare: Share) => {
		if (editingShare) {
			const updated = shares.map(s => (s.url === editingShare.url ? updatedShare : s))
			setShares(updated)
		} else {
			setShares([...shares, updatedShare])
		}
	}

	const handleDelete = (share: Share) => {
		if (confirm(`确定要删除 ${share.name} 吗？`)) {
			setShares(shares.filter(s => s.url !== share.url))
		}
	}

	const handleChoosePrivateKey = async (file: File) => {
		try {
			const text = await file.text()
			setPrivateKey(text)
			// 选择文件后自动保存云端
			await handlePublishCloud()
		} catch (error) {
			console.error('Failed to read private key:', error)
			toast.error('读取密钥文件失败')
		}
	}

	const handleSaveLocal = async () => {
		setIsSaving(true)

		try {
			const res = await fetch('/api/save-data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target: 'share', data: shares }) })
			const data = await res.json()
			if (!data.success) throw new Error(data.error)

			setOriginalShares(shares)
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
			await pushShares({
				shares,
				logoItems
			})

			setOriginalShares(shares)
			setLogoItems(new Map())
			setIsEditMode(false)
			toast.success('云端发布成功！')
		} catch (error: any) {
			console.error('Failed to save:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleCancel = () => {
		setShares(originalShares)
		setLogoItems(new Map())
		setIsEditMode(false)
	}

	const buttonText = isAuth ? '发布云端' : '导入密钥'

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

	const sortedShares = [...shares].sort((a, b) => {
		if (a.isPinned && !b.isPinned) return -1
		if (!a.isPinned && b.isPinned) return 1
		return 0
	})

	return (
		<>
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

			<div className='mx-auto w-full max-w-7xl px-6 pt-32'>
				<Link href='/favorite' className='inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-medium'>
					<ArrowLeft className='w-4 h-4' /> Back to Favorites
				</Link>
			</div>

			<GridView shares={sortedShares} isEditMode={isEditMode} onUpdate={handleUpdate} onDelete={handleDelete} />

			<motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} className='absolute right-6 flex gap-3 max-sm:hidden z-40' style={{ top: '6rem' }}>
				{isEditMode ? (
					<>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleCancel}
							disabled={isSaving}
							className='rounded-xl border bg-white/60 px-6 py-2 text-sm'>
							取消
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleAdd}
							className='rounded-xl border bg-white/60 px-6 py-2 text-sm'>
							添加
						</motion.button>
						<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSaveLocal} disabled={isSaving} className='rounded-xl border bg-white/60 px-6 py-2 text-sm'>
							保存本地
						</motion.button>
						<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePublishCloudClick} disabled={isSaving} className='brand-btn px-6'>
							{isSaving ? '发布中...' : buttonText}
						</motion.button>
					</>
				) : (
					!hideEditButton && (
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setIsEditMode(true)}
							className='bg-card rounded-xl border px-6 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-white/80'>
							编辑
						</motion.button>
					)
				)}
			</motion.div>

			{isCreateDialogOpen && <CreateDialog share={editingShare} onClose={() => setIsCreateDialogOpen(false)} onSave={handleSaveShare} />}
		</>
	)
}
