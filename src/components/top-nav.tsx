'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { toast } from 'sonner'
import { Dock, DockIcon } from '@/components/magicui/dock'

// Nav Icons
import ScrollOutlineSVG from '@/svgs/scroll-outline.svg'
import ProjectsOutlineSVG from '@/svgs/projects-outline.svg'
import AboutOutlineSVG from '@/svgs/about-outline.svg'
import ShareOutlineSVG from '@/svgs/share-outline.svg'
import WebsiteOutlineSVG from '@/svgs/website-outline.svg'
import DiaryOutlineSVG from '@/svgs/diary-outline.svg'
import BooksOutlineSVG from '@/svgs/books-outline.svg'

// Social Icons
import GithubSVG from '@/svgs/github.svg'
import JuejinSVG from '@/svgs/juejin.svg'
import EmailSVG from '@/svgs/email.svg'
import XSVG from '@/svgs/x.svg'
import TgSVG from '@/svgs/tg.svg'
import WechatSVG from '@/svgs/wechat.svg'
import FacebookSVG from '@/svgs/facebook.svg'
import TiktokSVG from '@/svgs/tiktok.svg'
import InstagramSVG from '@/svgs/instagram.svg'
import WeiboSVG from '@/svgs/weibo.svg'
import XiaohongshuSVG from '@/svgs/小红书.svg'
import ZhihuSVG from '@/svgs/知乎.svg'
import BilibiliSVG from '@/svgs/哔哩哔哩.svg'
import QqSVG from '@/svgs/qq.svg'

const navList = [
	{ icon: ScrollOutlineSVG, label: 'Blog', href: '/blog' },
	{ icon: ProjectsOutlineSVG, label: 'Projects', href: '/projects' },
	{ icon: AboutOutlineSVG, label: 'About', href: '/about' },
	{ icon: DiaryOutlineSVG, label: 'Diary', href: '/diary' },
	{ icon: BooksOutlineSVG, label: 'Favorite', href: '/favorite' }
]

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
	github: GithubSVG,
	juejin: JuejinSVG,
	email: EmailSVG,
	wechat: WechatSVG,
	x: XSVG,
	tg: TgSVG,
	facebook: FacebookSVG,
	tiktok: TiktokSVG,
	instagram: InstagramSVG,
	weibo: WeiboSVG,
	xiaohongshu: XiaohongshuSVG,
	zhihu: ZhihuSVG,
	bilibili: BilibiliSVG,
	qq: QqSVG,
	link: () => null
}

const TooltipWrapper = ({ children, content, href, onClick, external }: { children: React.ReactNode, content: string, href?: string, onClick?: () => void, external?: boolean }) => {
	const contentNode = (
		<div className="relative group/tooltip flex items-center justify-center size-full">
			{children}
			<div className="absolute bottom-full mb-3 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none scale-95 group-hover/tooltip:scale-100 ease-out flex-col items-center flex z-[100]">
				<div className="bg-neutral-800 border border-neutral-700 text-neutral-200 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xl whitespace-nowrap">
					{content}
				</div>
				<div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-neutral-800" />
			</div>
		</div>
	)

	if (href) {
		if (external) {
			return <a href={href} target="_blank" className="size-full block">{contentNode}</a>
		}
		return <Link href={href} className="size-full block">{contentNode}</Link>
	}

	if (onClick) {
		return <button onClick={onClick} className="size-full block">{contentNode}</button>
	}

	return <div className="size-full">{contentNode}</div>
}

export default function TopNav() {
	const pathname = usePathname()
	const { siteContent } = useConfigStore()
	
	const activeIndex = useMemo(() => {
		const index = navList.findIndex(item => pathname === item.href)
		return index >= 0 ? index : -1
	}, [pathname])

	const sortedSocialButtons = useMemo(() => {
		const buttons = (siteContent.socialButtons || []) as any[]
		return [...buttons].sort((a, b) => a.order - b.order)
	}, [siteContent.socialButtons])

	const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({})
	const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({})
	const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({})

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as Node
			Object.keys(openDropdowns).forEach(buttonId => {
				if (openDropdowns[buttonId]) {
					const buttonRef = buttonRefs.current[buttonId]
					const dropdownRef = dropdownRefs.current[buttonId]
					if (buttonRef && !buttonRef.contains(target) && dropdownRef && !dropdownRef.contains(target)) {
						setOpenDropdowns(prev => ({ ...prev, [buttonId]: false }))
					}
				}
			})
		}

		if (Object.values(openDropdowns).some(Boolean)) {
			document.addEventListener('mousedown', handleClickOutside)
			return () => {
				document.removeEventListener('mousedown', handleClickOutside)
			}
		}
	}, [openDropdowns])

	return (
		<div className="pointer-events-none fixed inset-x-0 bottom-8 z-50 w-full">
			<Dock style={{ height: 56 }} iconMagnification={64} iconDistance={140} className="pointer-events-auto relative mx-auto flex p-2 w-fit gap-2 bg-white/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 backdrop-blur-3xl shadow-[0_0_10px_3px] shadow-black/5 rounded-full">
				
				{/* Home */}
				<DockIcon className="rounded-3xl cursor-pointer bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm">
					<TooltipWrapper content="Home" href="/">
						<img src='/images/avatar.png' alt='avatar' className='size-full object-cover rounded-3xl grayscale hover:grayscale-0 transition-transform p-0.5' />
					</TooltipWrapper>
				</DockIcon>

				{/* Nav Links */}
				{navList.map((item, index) => {
					const isActive = activeIndex === index
					return (
						<DockIcon key={item.href} className={cn(
							"rounded-3xl cursor-pointer bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm",
							isActive ? "text-brand" : "text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
						)}>
							<TooltipWrapper content={item.label} href={item.href}>
								<item.icon className="size-full p-0.5" />
							</TooltipWrapper>
						</DockIcon>
					)
				})}

				<div className="h-8 w-[1px] bg-neutral-200 dark:bg-neutral-800 mx-1 shrink-0" />

				{/* Social Links */}
				{sortedSocialButtons.map((button) => {
					const Icon = iconMap[button.type]
					if (!Icon) return null

					const commonDockIconProps = {
						className: "rounded-3xl cursor-pointer bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
					}
					
					const label = button.type.charAt(0).toUpperCase() + button.type.slice(1);

					if (button.type === 'email' || button.type === 'wechat' || button.type === 'qq') {
						const isImagePath = button.value.startsWith('/images/social-buttons/')
						if (isImagePath && (button.type === 'wechat' || button.type === 'qq')) {
							const isOpen = openDropdowns[button.id] || false
							return (
								<DockIcon key={button.id} {...commonDockIconProps}>
									<button ref={el => { buttonRefs.current[button.id] = el }} className="size-full">
										<TooltipWrapper content={label} onClick={() => setOpenDropdowns(prev => ({ ...prev, [button.id]: !prev[button.id] }))}>
											<Icon className='size-full p-0.5' />
										</TooltipWrapper>
									</button>
									{typeof window !== 'undefined' && createPortal(
										<AnimatePresence>
											{isOpen && (
												<>
													<motion.div
														initial={{ opacity: 0 }}
														animate={{ opacity: 1 }}
														exit={{ opacity: 0 }}
														onClick={() => setOpenDropdowns(prev => ({ ...prev, [button.id]: false }))}
														className='fixed inset-0 z-40'
													/>
													<motion.div
														ref={el => { dropdownRefs.current[button.id] = el }}
														initial={{ opacity: 0, y: 8, scale: 0.95 }}
														animate={{ opacity: 1, y: 0, scale: 1 }}
														exit={{ opacity: 0, y: 8, scale: 0.95 }}
														transition={{ duration: 0.2 }}
														className='bg-neutral-900 fixed z-50 rounded-2xl border border-neutral-700 p-4 backdrop-blur-xl shadow-2xl'
														style={{
															top: buttonRefs.current[button.id] ? `${buttonRefs.current[button.id]!.getBoundingClientRect().top - 210}px` : '0px',
															left: buttonRefs.current[button.id] ? `${buttonRefs.current[button.id]!.getBoundingClientRect().left - 80}px` : '0px',
														}}>
														<img src={button.value} alt='QR Code' className='w-40 h-40 object-cover rounded-lg' />
													</motion.div>
												</>
											)}
										</AnimatePresence>,
										document.body
									)}
								</DockIcon>
							)
						}
						
						return (
							<DockIcon key={button.id} {...commonDockIconProps}>
								<TooltipWrapper 
									content={label} 
									onClick={() => {
										navigator.clipboard.writeText(button.value).then(() => {
											toast.success('已复制到剪贴板')
										})
									}}
								>
									<Icon className='size-full p-0.5' />
								</TooltipWrapper>
							</DockIcon>
						)
					}

					return (
						<DockIcon key={button.id} {...commonDockIconProps}>
							<TooltipWrapper content={label} href={button.value} external>
								<Icon className='size-full p-0.5' />
							</TooltipWrapper>
						</DockIcon>
					)
				})}
			</Dock>
		</div>
	)
}
