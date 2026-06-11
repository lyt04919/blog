'use client'

import { FavoriteItemPageTemplate } from '../components/favorite-item-page-template'
import initialVideos from '../videos.json'

export default function FavoriteVideosPage() {
	return (
		<FavoriteItemPageTemplate
			initialItems={initialVideos}
			targetType="videos"
			pageTitle="精选视频"
			pageDescription="推荐视频与纪录片：收集对我有极大启发的技术演讲、产品概念片及视觉艺术短片。"
		/>
	)
}
