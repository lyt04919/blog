'use client'

import { useWriteStore } from './stores/write-store'
import { usePreviewStore } from './stores/preview-store'
import { WriteEditor } from './components/editor'
import { WriteSidebar } from './components/sidebar'
import { WriteActions } from './components/actions'
import { WritePreview } from './components/preview'
import { useEffect } from 'react'

export default function WritePage() {
	const { form, cover, reset, isZenMode, isSplitMode } = useWriteStore()
	useEffect(() => reset(), [])
	const { isPreview, closePreview } = usePreviewStore()

	const coverPreviewUrl = cover ? (cover.type === 'url' ? cover.url : cover.previewUrl) : null

	if (isPreview) {
		return <WritePreview form={form} coverPreviewUrl={coverPreviewUrl} onClose={closePreview} />
	}

	return (
		<div className={`flex h-full flex-col items-center gap-6 px-6 pt-24 pb-12 ${isSplitMode ? 'w-full max-w-none' : ''}`}>
			<div className={`w-full ${isSplitMode ? 'max-w-[1800px]' : 'max-w-[1144px]'}`}>
				<WriteActions />
			</div>
			<div className={`flex w-full justify-center gap-6 ${isSplitMode ? 'max-w-[1800px]' : 'max-w-[1144px]'}`}>
				<WriteEditor />
				{!isZenMode && !isSplitMode && <WriteSidebar />}
				{isSplitMode && (
					<div 
						style={{ height: 'calc(100vh - 220px)', minHeight: '600px' }}
						className="flex-1 min-w-0 overflow-hidden"
					>
						<WritePreview form={form} coverPreviewUrl={coverPreviewUrl} onClose={closePreview} isSplit={true} />
					</div>
				)}
			</div>
		</div>
	)
}
