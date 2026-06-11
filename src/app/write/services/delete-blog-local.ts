export async function deleteBlogLocal(slug: string): Promise<void> {
	if (!slug) throw new Error('需要 slug')

	const res = await fetch('/api/delete-blog-local', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ slug })
	})

	const data = await res.json()
	if (!res.ok || !data.success) {
		throw new Error(data.error || '本地删除失败')
	}
}
