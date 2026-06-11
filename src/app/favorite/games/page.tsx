'use client'

import { FavoriteItemPageTemplate } from '../components/favorite-item-page-template'
import initialGames from '../games.json'

export default function FavoriteGamesPage() {
	return (
		<FavoriteItemPageTemplate
			initialItems={initialGames}
			targetType="games"
			pageTitle="Games"
			pageDescription="游玩的游戏：记录我在虚拟世界中冒险过的足迹，以及通关后的星级推荐评分。"
		/>
	)
}
