import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export async function POST(request: Request) {
	try {
		const formData = await request.formData()
		const file = formData.get('file') as File | null
		
		if (!file) {
			return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
		}

		const bytes = await file.arrayBuffer()
		const buffer = Buffer.from(bytes)

		// Generate unique filename to prevent collisions
		const hash = crypto.randomBytes(8).toString('hex')
		const ext = path.extname(file.name) || '.png'
		const fileName = `${hash}${ext}`
		
		// Support dynamic folder (e.g. 'files/books' for epub/pdf)
		const folder = (formData.get('folder') as string) || 'images/uploads'
		
		// Ensure directory exists
		const uploadDir = path.join(process.cwd(), 'public', ...folder.split('/'))
		await mkdir(uploadDir, { recursive: true })
		
		const filePath = path.join(uploadDir, fileName)
		await writeFile(filePath, buffer)
		
		// Return the public URL
		return NextResponse.json({ url: `/${folder}/${fileName}` })
	} catch (e) {
		console.error('Upload error:', e)
		return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
	}
}
