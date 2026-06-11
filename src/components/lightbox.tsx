'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface LightboxProps {
	mediaList: string[]
	initialIndex?: number
	onClose: () => void
}

export default function Lightbox({ mediaList, initialIndex = 0, onClose }: LightboxProps) {
	const [currentIndex, setCurrentIndex] = useState(initialIndex)
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
	}, [])

	useEffect(() => {
		const previousOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.stopPropagation()
				e.stopImmediatePropagation()
				onClose()
			}
			if (e.key === 'ArrowRight') handleNext()
			if (e.key === 'ArrowLeft') handlePrev()
		}
		
		window.addEventListener('keydown', handleKeyDown, { capture: true })
		return () => {
			window.removeEventListener('keydown', handleKeyDown, { capture: true })
			document.body.style.overflow = previousOverflow
		}
	}, [currentIndex, onClose])

	const handleNext = () => {
		setCurrentIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1))
	}

	const handlePrev = () => {
		setCurrentIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1))
	}

	const currentMedia = mediaList[currentIndex]
	const isVideo = currentMedia?.endsWith('.mp4') || currentMedia?.endsWith('.webm')

	if (!mounted) return null

	return createPortal(
		<div className="fixed inset-0 z-[100] flex flex-col bg-black/80 backdrop-blur-md" onClick={onClose}>
			{/* Top Bar */}
			<div className="absolute top-0 inset-x-0 h-24 flex items-center justify-between px-6 z-50 pointer-events-none">
				{mediaList.length > 1 ? (
					<div className="px-4 py-1.5 bg-black/50 backdrop-blur text-white text-sm font-medium rounded-full pointer-events-auto">
						{currentIndex + 1} / {mediaList.length}
					</div>
				) : <div />}
				<button 
					onClick={(e) => { e.stopPropagation(); onClose(); }}
					className="p-2.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors pointer-events-auto"
				>
					<X size={24} />
				</button>
			</div>

			{/* Main Content Area */}
			<div className="flex-1 w-full h-full relative flex items-center justify-center overflow-hidden">
				<AnimatePresence mode="wait">
					<motion.div
						key={currentIndex}
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.2 }}
						className="absolute inset-0 p-4 pb-24 md:p-20 flex items-center justify-center pointer-events-none"
					>
						{isVideo ? (
							<video 
								src={currentMedia} 
								controls 
								autoPlay 
								playsInline 
								className="max-w-full max-h-full object-contain rounded-xl shadow-2xl pointer-events-auto" 
								style={{ maxHeight: '85vh', maxWidth: '85vw' }}
								onClick={(e) => e.stopPropagation()}
							/>
						) : (
							<img 
								src={currentMedia} 
								alt={`Media ${currentIndex + 1}`} 
								className="max-w-full max-h-full object-contain rounded-xl shadow-2xl select-none pointer-events-auto" 
								style={{ maxHeight: '85vh', maxWidth: '85vw' }}
								onClick={(e) => e.stopPropagation()}
							/>
						)}
					</motion.div>
				</AnimatePresence>

				{mediaList.length > 1 && (
					<>
						<button 
							onClick={(e) => { e.stopPropagation(); handlePrev(); }}
							className="absolute p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors pointer-events-auto z-50"
							style={{ left: '2rem', top: '50%', transform: 'translateY(-50%)' }}
						>
							<ChevronLeft size={32} />
						</button>
						<button 
							onClick={(e) => { e.stopPropagation(); handleNext(); }}
							className="absolute p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors pointer-events-auto z-50"
							style={{ right: '2rem', top: '50%', transform: 'translateY(-50%)' }}
						>
							<ChevronRight size={32} />
						</button>
					</>
				)}
			</div>
		</div>,
		document.body
	)
}
