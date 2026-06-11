import LikeButton from '@/components/like-button'
import { ANIMATION_DELAY, CARD_SPACING } from '@/consts'
import { motion } from 'motion/react'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { HomeDraggableLayer } from './home-draggable-layer'

export default function LikePosition() {
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const styles = cardStyles.likePosition
	const hiCardStyles = cardStyles.hiCard
	const socialButtonsStyles = cardStyles.socialButtons
	const musicCardStyles = cardStyles.musicCard
	const shareCardStyles = cardStyles.shareCard

	const shareCardX =
		center.x +
		CARD_SPACING +
		hiCardStyles.width / 2 +
		(cardStyles.calendarCard.width - (shareCardStyles.width + styles.width + CARD_SPACING)) / 2
	const x = styles.offsetX !== null ? center.x + styles.offsetX : shareCardX + shareCardStyles.width + CARD_SPACING
	const y =
		styles.offsetY !== null
			? center.y + styles.offsetY
			: (center.y - hiCardStyles.height / 2 - cardStyles.artCard.height - CARD_SPACING) +
				cardStyles.writeButtons.height +
				CARD_SPACING +
				cardStyles.clockCard.height +
				CARD_SPACING +
				cardStyles.calendarCard.height +
				CARD_SPACING +
				(shareCardStyles.height - styles.height) / 2

	return (
		<HomeDraggableLayer cardKey='likePosition' x={x} y={y} width={styles.width} height={styles.height}>
			<motion.div className='absolute max-sm:static' initial={{ left: x, top: y }} animate={{ left: x, top: y }}>
				{siteContent.enableChristmas && (
					<>
						<img
							src='/images/christmas/snow-13.webp'
							alt='Christmas decoration'
							className='pointer-events-none absolute'
							style={{ width: 40, left: -4, top: -4, opacity: 0.9 }}
						/>
					</>
				)}

				<LikeButton delay={cardStyles.likePosition.order * ANIMATION_DELAY * 1000} />
			</motion.div>
		</HomeDraggableLayer>
	)
}
