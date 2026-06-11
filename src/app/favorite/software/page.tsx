'use client'

import { FavoriteItemPageTemplate } from '../components/favorite-item-page-template'
import initialSoftware from '../software.json'

export default function FavoriteSoftwarePage() {
	return (
		<FavoriteItemPageTemplate
			initialItems={initialSoftware}
			targetType="software"
			pageTitle="Software"
			pageDescription="开发工具与效率软件：陪伴我日常编程、设计以及内容创作的主力应用程序与云服务。"
		/>
	)
}
