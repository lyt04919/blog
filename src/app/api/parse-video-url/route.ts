import { NextResponse } from 'next/server'

function decodeHtmlEntities(str: string): string {
	return str
		.replace(/&quot;/g, '"')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&#39;/g, "'")
		.replace(/&nbsp;/g, ' ')
}

function extractMeta(html: string, nameOrProperty: string): string | null {
	const regex1 = new RegExp(`<meta[^>]+(?:property|name)=["']${nameOrProperty}["'][^>]+content=["']([^"']+)["']`, 'i')
	const regex2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${nameOrProperty}["']`, 'i')
	
	const match1 = html.match(regex1)
	if (match1 && match1[1]) return decodeHtmlEntities(match1[1])
	
	const match2 = html.match(regex2)
	if (match2 && match2[1]) return decodeHtmlEntities(match2[1])
	
	return null
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const url = searchParams.get('url')

	if (!url) {
		return NextResponse.json({ error: 'URL is required' }, { status: 400 })
	}

	const headers = {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
		'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
		'Referer': 'https://www.bilibili.com'
	}

	try {
		let targetUrl = url

		// Resolve b23.tv shortened links if applicable
		if (url.includes('b23.tv')) {
			try {
				const redirectRes = await fetch(url, { headers, redirect: 'follow' })
				if (redirectRes.ok && redirectRes.url) {
					targetUrl = redirectRes.url
				}
			} catch (e) {
				console.error('Failed to resolve b23.tv redirect:', e)
			}
		}

		// 1. Check if it is Bilibili
		const bilibiliBvMatch = targetUrl.match(/(BV[a-zA-Z0-9]{10})/i)
		const bilibiliAvMatch = targetUrl.match(/av(\d+)/i)
		
		if (bilibiliBvMatch || bilibiliAvMatch) {
			const bvid = bilibiliBvMatch ? bilibiliBvMatch[1] : ''
			const aid = bilibiliAvMatch ? bilibiliAvMatch[1] : ''
			const apiUrl = bvid 
				? `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`
				: `https://api.bilibili.com/x/web-interface/view?aid=${aid}`
			
			const res = await fetch(apiUrl, { headers })
			if (res.ok) {
				const apiData = await res.json()
				if (apiData.code === 0 && apiData.data) {
					const d = apiData.data
					let cover = d.pic || ''
					if (cover.startsWith('http://')) {
						cover = cover.replace('http://', 'https://')
					}
					return NextResponse.json({
						title: d.title || '',
						desc: d.desc || '',
						cover: cover,
						subtitle: d.owner?.name || '',
						embedLink: `https://player.bilibili.com/player.html?bvid=${d.bvid || bvid}&page=1&high_quality=1&as_wide=1`
					})
				}
			}
		}

		// 2. Check if it is YouTube
		const ytRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
		const ytMatch = targetUrl.match(ytRegex)
		const ytId = (ytMatch && ytMatch[2].length === 11) ? ytMatch[2] : null

		if (ytId) {
			const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`
			const res = await fetch(oembedUrl, { headers })
			if (res.ok) {
				const ytData = await res.json()
				return NextResponse.json({
					title: ytData.title || '',
					desc: '',
					cover: ytData.thumbnail_url || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
					subtitle: ytData.author_name || '',
					embedLink: `https://www.youtube.com/embed/${ytId}`
				})
			} else {
				return NextResponse.json({
					title: '',
					desc: '',
					cover: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
					subtitle: '',
					embedLink: `https://www.youtube.com/embed/${ytId}`
				})
			}
		}

		// 3. Fallback: Generic Scraper
		const res = await fetch(targetUrl, { headers, next: { revalidate: 60 } })
		if (!res.ok) {
			return NextResponse.json({ error: `Failed to fetch target URL: ${res.statusText}` }, { status: 400 })
		}

		const html = await res.text()

		const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
		const title = titleMatch ? decodeHtmlEntities(titleMatch[1].trim()) : ''
		const ogTitle = extractMeta(html, 'og:title')
		const description = extractMeta(html, 'description')
		const ogDescription = extractMeta(html, 'og:description')
		const ogImage = extractMeta(html, 'og:image')

		return NextResponse.json({
			title: ogTitle || title || '',
			desc: ogDescription || description || '',
			cover: ogImage || '',
			subtitle: ''
		})
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 })
	}
}
