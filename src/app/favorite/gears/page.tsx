'use client'

import { FavoriteItemPageTemplate } from '../components/favorite-item-page-template'
import initialGears from '../gears.json'

export default function FavoriteGearsPage() {
	return (
		<FavoriteItemPageTemplate
			initialItems={initialGears}
			targetType="gears"
			pageTitle="Gears"
			pageDescription="桌面装备与数码配件：展示在写代码和日常生活中伴随我的硬核生产力工具。"
		/>
	)
}
