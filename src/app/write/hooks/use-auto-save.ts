import { useEffect, useRef } from 'react'
import { useWriteStore } from '../stores/write-store'
import { saveBlogLocal } from '../services/save-blog-local'

export function useAutoSave() {
	const { form, cover, images, mode, originalSlug, autoSaveStatus, setAutoSaveStatus } = useWriteStore()
	
	const timeoutRef = useRef<NodeJS.Timeout | null>(null)
	
	// Keep a ref to the latest values so we don't trigger effect on every single reference change,
	// but we do want to trigger when the content actually changes.
	const latestData = useRef({ form, cover, images, mode, originalSlug })
	latestData.current = { form, cover, images, mode, originalSlug }

	useEffect(() => {
		// Only run auto-save if we have a slug and title (basic validity check)
		if (!form.slug || !form.title) return

		// Don't queue an autosave if we're already saving
		if (autoSaveStatus === 'saving') return

		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
		}

		timeoutRef.current = setTimeout(async () => {
			try {
				setAutoSaveStatus('saving')
				await saveBlogLocal(latestData.current)
				setAutoSaveStatus('saved')
				
				// Reset to idle after a few seconds
				setTimeout(() => {
					if (useWriteStore.getState().autoSaveStatus === 'saved') {
						useWriteStore.getState().setAutoSaveStatus('idle')
					}
				}, 3000)
			} catch (err) {
				console.error('Auto-save failed:', err)
				setAutoSaveStatus('error')
			}
		}, 3000)

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
		}
	}, [form, cover, images]) // Trigger when these change
}
