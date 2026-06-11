import { useCallback } from 'react'
import { readFileAsText } from '@/lib/file-utils'
import { toast } from 'sonner'
import { pushBlog } from '../services/push-blog'
import { deleteBlog } from '../services/delete-blog'
import { useWriteStore } from '../stores/write-store'
import { useAuthStore } from '@/hooks/use-auth'

export function usePublish() {
	const { loading, setLoading, form, cover, images, mode, originalSlug } = useWriteStore()
	const { isAuth, setPrivateKey } = useAuthStore()

	const onChoosePrivateKey = useCallback(
		async (file: File) => {
			const pem = await readFileAsText(file)
			setPrivateKey(pem)
		},
		[setPrivateKey]
	)

	const onPublish = useCallback(async () => {
		try {
			setLoading(true)
			await pushBlog({
				form,
				cover,
				images,
				mode,
				originalSlug
			})

			const successMsg = mode === 'edit' ? '更新成功' : '发布成功'
			toast.success(successMsg)
			
			// Update local status to published
			useWriteStore.getState().updateForm({ status: 'published' })
			const { saveBlogLocal } = await import('../services/save-blog-local')
			await saveBlogLocal({
				form: useWriteStore.getState().form,
				cover,
				images,
				mode,
				originalSlug
			})
		} catch (err: any) {
			console.error(err)
			toast.error(err?.message || '操作失败')
		} finally {
			setLoading(false)
		}
	}, [form, cover, images, mode, originalSlug, setLoading])

	const onDelete = useCallback(
		async (isLocalOnly: boolean = false) => {
			const targetSlug = originalSlug || form.slug
			if (!targetSlug) {
				toast.error('缺少 slug，无法删除')
				return
			}
			try {
				setLoading(true)
				
				let localSuccess = false
				let remoteSuccess = false

				// Try local delete first
				try {
					const { deleteBlogLocal } = await import('../services/delete-blog-local')
					await deleteBlogLocal(targetSlug)
					localSuccess = true
				} catch (e: any) {
					console.log('Local delete failed or not supported:', e)
				}

				// If they want to delete from remote and are authed
				if (!isLocalOnly && isAuth) {
					await deleteBlog(targetSlug)
					remoteSuccess = true
				}

				if (remoteSuccess) {
					toast.success('删除成功！请等待页面部署后刷新')
				} else if (localSuccess) {
					toast.success('本地删除成功！')
				} else if (!isAuth) {
					toast.error('未导入密钥，且本地删除失败')
				}
				
				return true
			} catch (err: any) {
				console.error(err)
				toast.error(err?.message || '删除失败')
				return false
			} finally {
				setLoading(false)
			}
		},
		[form.slug, originalSlug, setLoading, isAuth]
	)

	return {
		isAuth,
		loading,
		onChoosePrivateKey,
		onPublish,
		onDelete
	}
}
