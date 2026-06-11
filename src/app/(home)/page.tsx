'use client'

import { useSize } from '@/hooks/use-size'
import { useConfigStore } from './stores/config-store'
import ConfigDialog from './config-dialog/index'
import { useEffect } from 'react'
import SnowfallBackground from '@/layout/backgrounds/snowfall'
import SwissHero from '@/components/home/swiss-hero'
import ExpandedContent from './expanded-content'

export default function Home() {
	const { maxSM } = useSize()
	const { configDialogOpen, setConfigDialogOpen, siteContent } = useConfigStore()

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && (e.key === 'l' || e.key === ',')) {
				e.preventDefault()
				setConfigDialogOpen(true)
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [setConfigDialogOpen])

	return (
		<>
			{siteContent.enableChristmas && <SnowfallBackground zIndex={0} count={!maxSM ? 125 : 20} />}

			<SwissHero />

			<ExpandedContent />

			{siteContent.enableChristmas && <SnowfallBackground zIndex={2} count={!maxSM ? 125 : 20} />}
			<ConfigDialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} />
		</>
	)
}
