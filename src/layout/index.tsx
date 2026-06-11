'use client'
import { PropsWithChildren } from 'react'
import { useCenterInit } from '@/hooks/use-center'
import BlurredBubblesBackground from './backgrounds/blurred-bubbles'
import TopNav from '@/components/top-nav'
import { useEffect, useMemo, useState } from 'react'
import { Toaster } from 'sonner'
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from 'lucide-react'
import { useSize, useSizeInit } from '@/hooks/use-size'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { ScrollTopButton } from '@/components/scroll-top-button'
import MusicCard from '@/components/music-card'

export default function Layout({ children }: PropsWithChildren) {
	useCenterInit()
	useSizeInit()
	const { cardStyles, siteContent, regenerateKey } = useConfigStore()
	const { maxSM, init } = useSize()

	const backgroundImages = (siteContent.backgroundImages ?? []) as Array<{ id: string; url: string }>
	const currentBackgroundImageId = siteContent.currentBackgroundImageId
	const currentBackgroundImage =
		currentBackgroundImageId && currentBackgroundImageId.trim() ? backgroundImages.find(item => item.id === currentBackgroundImageId) : null

	useEffect(() => {
		const handler = (e: ErrorEvent) => {
			fetch('/api/log-error', { method: 'POST', body: e.message + '\n' + e.error?.stack })
		}
		window.addEventListener('error', handler)
		const rejectionHandler = (e: PromiseRejectionEvent) => {
			fetch('/api/log-error', { method: 'POST', body: 'Unhandled Rejection: ' + e.reason })
		}
		window.addEventListener('unhandledrejection', rejectionHandler)
		return () => {
			window.removeEventListener('error', handler)
			window.removeEventListener('unhandledrejection', rejectionHandler)
		}
	}, [])

	return (
		<>
			<Toaster
				position='bottom-right'
				richColors
				icons={{
					success: <CircleCheckIcon className='size-4' />,
					info: <InfoIcon className='size-4' />,
					warning: <TriangleAlertIcon className='size-4' />,
					error: <OctagonXIcon className='size-4' />,
					loading: <Loader2Icon className='size-4 animate-spin' />
				}}
				style={
					{
						'--border-radius': '12px'
					} as React.CSSProperties
				}
			/>
			{currentBackgroundImage && (
				<div
					className='fixed inset-0 z-0 overflow-hidden'
					style={{
						backgroundImage: `url(${currentBackgroundImage.url})`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat'
					}}
				/>
			)}
			<BlurredBubblesBackground 
				colors={siteContent.backgroundColors} 
				regenerateKey={regenerateKey} 
				count={8} 
				bottomBandStart={0} 
				targetFps={24} 
				speed={0.15} 
			/>

			<main className='relative z-10 min-h-full pt-8 pb-24'>
				{children}
				<TopNav />

				{!maxSM && cardStyles.musicCard?.enabled !== false && <MusicCard />}
			</main>

			{maxSM && init && <ScrollTopButton className='bg-brand/20 fixed right-6 bottom-24 z-50 shadow-md' />}
		</>
	)
}
