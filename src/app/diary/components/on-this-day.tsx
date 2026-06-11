'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import dayjs from 'dayjs'
import type { Diary } from './diary-card'
import { Clock, X } from 'lucide-react'
import DiaryDetailModal from './diary-detail-modal'

interface OnThisDayProps {
	diaries: Diary[]
}

export default function OnThisDay({ diaries }: OnThisDayProps) {
	const [isVisible, setIsVisible] = useState(true)
	const [isDetailOpen, setIsDetailOpen] = useState(false)

	const historicalDiaries = useMemo(() => {
		const todayStr = dayjs().format('MM-DD')
		const currentYear = dayjs().year()
		
		return diaries.filter(d => {
			const dDate = dayjs(d.date)
			return dDate.format('MM-DD') === todayStr && dDate.year() < currentYear
		}).sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix()) // sort by newest first
	}, [diaries])

	if (historicalDiaries.length === 0 || !isVisible) return null

	const diary = historicalDiaries[0] // show the most recent historical one
	const yearsAgo = dayjs().year() - dayjs(diary.date).year()

	return (
		<>
			<AnimatePresence>
				{isVisible && (
					<motion.div 
						initial={{ opacity: 0, y: -20, height: 0 }}
						animate={{ opacity: 1, y: 0, height: 'auto' }}
						exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
						className="mb-8 relative rounded-[32px] bg-gradient-to-br from-brand/10 via-white to-brand/5 border border-brand/20 shadow-sm p-6 md:p-8 overflow-hidden group cursor-pointer"
						onClick={() => setIsDetailOpen(true)}
					>
						{/* Decorative Background */}
						<div className="absolute -right-12 -top-12 text-brand/5 rotate-12 transition-transform duration-700 group-hover:rotate-0">
							<Clock size={160} strokeWidth={1} />
						</div>

						<button 
							onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
							className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-black/5 transition-colors z-10"
						>
							<X size={16} />
						</button>

						<div className="relative z-10 flex flex-col-reverse md:flex-row gap-6 items-start md:items-center">
							<div className="flex-1">
								<div className="flex items-center gap-2 text-brand font-bold text-sm tracking-widest uppercase mb-3">
									<Clock size={16} />
									<span>那年今日 · {yearsAgo}年前</span>
								</div>
								<p className="text-neutral-800 leading-relaxed font-medium line-clamp-2 md:line-clamp-3 text-lg md:text-xl">
									{diary.content}
								</p>
								<div className="mt-4 flex items-center gap-4 text-xs text-neutral-500 font-medium">
									<span>{dayjs(diary.date).format('YYYY年M月D日')}</span>
									{diary.mood && <span>{diary.mood}</span>}
									{diary.weather && <span>{diary.weather}</span>}
								</div>
							</div>

							{diary.media && diary.media.length > 0 && typeof diary.media[0] === 'string' ? (
								<div className="shrink-0 w-full h-40 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-sm border border-black/5 rotate-0 md:rotate-3 group-hover:rotate-0 transition-transform duration-500">
									{diary.media[0].endsWith('.mp4') || diary.media[0].endsWith('.webm') ? (
										<video src={`${diary.media[0]}#t=0.001`} className="w-full h-full object-cover" muted playsInline preload="metadata" />
									) : (
										<img src={diary.media[0]} alt="Historical media" className="w-full h-full object-cover" loading="lazy" decoding="async" />
									)}
								</div>
							) : diary.image ? (
								<div className="shrink-0 w-full h-40 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-sm border border-black/5 rotate-0 md:rotate-3 group-hover:rotate-0 transition-transform duration-500">
									<img src={diary.image} alt="Historical media" className="w-full h-full object-cover" loading="lazy" decoding="async" />
								</div>
							) : null}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{isDetailOpen && <DiaryDetailModal diary={diary} onClose={() => setIsDetailOpen(false)} />}
		</>
	)
}
