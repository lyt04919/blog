export type BlogIndexItem = {
	slug: string
	title: string
	tags: string[]
	date: string
	summary?: string
	cover?: string
	hidden?: boolean
	category?: string
	status?: 'draft' | 'published'
}

export type BlogConfig = {
	title?: string
	tags?: string[]
	date?: string
	summary?: string
	cover?: string
	hidden?: boolean
	category?: string
}

