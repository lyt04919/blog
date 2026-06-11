'use client'

import { motion } from 'motion/react'
import { useWriteStore } from '../stores/write-store'
import { INIT_DELAY } from '@/consts'
import { useRef, useState, useMemo } from 'react'
import { WriteStats } from './stats'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { EditorView } from '@codemirror/view'
import { keymap } from '@codemirror/view'
import { indentWithTab } from '@codemirror/commands'
import { WriteEditorToc } from './editor-toc'

const defaultText = 'text'

export function WriteEditor() {
	const { form, updateForm, addFiles, isZenMode, isSplitMode } = useWriteStore()
	const viewRef = useRef<EditorView | null>(null)
	const [activeLine, setActiveLine] = useState(1)

	// Custom CodeMirror theme targeting the app's glassmorphism style
	const customTheme = useMemo(() => {
		return EditorView.theme({
			"&": {
				backgroundColor: "transparent !important",
				height: "100%",
			},
			".cm-scroller": {
				overflow: "auto",
				fontFamily: "inherit",
				scrollbarWidth: "none", // Firefox
			},
			".cm-scroller::-webkit-scrollbar": {
				display: "none" // Safari & Chrome
			},
			".cm-content": {
				padding: "16px 8px",
				fontSize: "14px",
				lineHeight: "1.7",
				color: "var(--color-primary)",
			},
			".cm-gutters": {
				backgroundColor: "transparent",
				borderRight: "none",
				color: "var(--color-secondary)",
				opacity: 0.4,
				paddingRight: "8px",
			},
			".cm-gutter": {
				backgroundColor: "transparent",
			},
			".cm-activeLine": {
				backgroundColor: "color-mix(in srgb, var(--color-brand) 4%, transparent) !important",
				borderRadius: "6px",
			},
			".cm-activeLineGutter": {
				backgroundColor: "transparent",
				color: "var(--color-brand)",
				fontWeight: "bold",
			},
			"&.cm-focused .cm-cursor": {
				borderLeftColor: "var(--color-brand)",
				borderLeftWidth: "2px",
			},
			"&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
				backgroundColor: "color-mix(in srgb, var(--color-brand) 15%, transparent) !important",
			}
		}, { dark: false })
	}, [])

	// Setup update listener to track current line of the cursor
	const updateListener = useMemo(() => {
		return EditorView.updateListener.of((update) => {
			if (update.selectionSet || update.docChanged) {
				const view = update.view
				const cursorLine = view.state.doc.lineAt(view.state.selection.main.head).number
				setActiveLine(cursorLine)
			}
		})
	}, [])

	const insertText = (text: string) => {
		const view = viewRef.current
		if (!view) return

		view.focus()
		const { state } = view
		const mainSelection = state.selection.main
		
		view.dispatch(
			state.update({
				changes: {
					from: mainSelection.from,
					to: mainSelection.to,
					insert: text
				},
				selection: { anchor: mainSelection.from + text.length },
				scrollIntoView: true
			})
		)
	}

	const toggleBold = () => {
		const view = viewRef.current
		if (!view) return

		view.focus()
		const { state } = view
		const { from, to } = state.selection.main
		const selectedText = state.sliceDoc(from, to)

		// Check if already surrounded by '**'
		const before = state.sliceDoc(from - 2, from)
		const after = state.sliceDoc(to, to + 2)
		const isBold = before === '**' && after === '**'

		if (isBold && selectedText) {
			view.dispatch(
				state.update({
					changes: { from: from - 2, to: to + 2, insert: selectedText },
					selection: { anchor: from - 2 + selectedText.length },
					scrollIntoView: true
				})
			)
		} else {
			const text = selectedText || defaultText
			view.dispatch(
				state.update({
					changes: { from, to, insert: `**${text}**` },
					selection: selectedText
						? { anchor: from + text.length + 4 }
						: { anchor: from + 2, head: from + 2 + defaultText.length },
					scrollIntoView: true
				})
			)
		}
	}

	const toggleItalic = () => {
		const view = viewRef.current
		if (!view) return

		view.focus()
		const { state } = view
		const { from, to } = state.selection.main
		const selectedText = state.sliceDoc(from, to)

		// Check if already surrounded by '*' (excluding '**')
		const before = state.sliceDoc(from - 1, from)
		const after = state.sliceDoc(to, to + 1)
		const isItalic = before === '*' && after === '*' && !(state.sliceDoc(from - 2, from) === '**' && state.sliceDoc(to, to + 2) === '**')

		if (isItalic && selectedText) {
			view.dispatch(
				state.update({
					changes: { from: from - 1, to: to + 1, insert: selectedText },
					selection: { anchor: from - 1 + selectedText.length },
					scrollIntoView: true
				})
			)
		} else {
			const text = selectedText || defaultText
			view.dispatch(
				state.update({
					changes: { from, to, insert: `*${text}*` },
					selection: selectedText
						? { anchor: from + text.length + 2 }
						: { anchor: from + 1, head: from + 1 + defaultText.length },
					scrollIntoView: true
				})
			)
		}
	}

	const toggleLink = () => {
		const view = viewRef.current
		if (!view) return

		view.focus()
		const { state } = view
		const { from, to } = state.selection.main
		const selectedText = state.sliceDoc(from, to)

		const text = selectedText || defaultText
		view.dispatch(
			state.update({
				changes: { from, to, insert: `[${text}](url)` },
				selection: { anchor: from + text.length + 3, head: from + text.length + 6 },
				scrollIntoView: true
			})
		)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		// Ctrl/Cmd + B: Toggle Bold
		if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
			e.preventDefault()
			toggleBold()
			return
		}

		// Ctrl/Cmd + I: Toggle Italic
		if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
			e.preventDefault()
			toggleItalic()
			return
		}

		// Ctrl/Cmd + K: Link
		if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
			e.preventDefault()
			toggleLink()
			return
		}
	}

	const handlePaste = async (e: React.ClipboardEvent) => {
		const items = e.clipboardData.items
		if (!items) return

		const imageFiles: File[] = []
		for (let i = 0; i < items.length; i++) {
			const item = items[i]
			if (item.type.startsWith('image/')) {
				const file = item.getAsFile()
				if (file) {
					imageFiles.push(file)
				}
			}
		}

		if (imageFiles.length > 0) {
			e.preventDefault()

			const resultImages = await addFiles(imageFiles).catch(() => [])

			if (resultImages && resultImages.length > 0) {
				const markdowns = resultImages.map(item => (item.type === 'url' ? `![](${item.url})` : `![](local-image:${item.id})`)).join('\n')
				insertText(markdowns)
			}
		}
	}

	const handleHeadingClick = (lineNum: number) => {
		const view = viewRef.current
		if (!view) return

		view.focus()
		const line = view.state.doc.line(lineNum)
		view.dispatch({
			effects: EditorView.scrollIntoView(line.from, { y: 'start', yMargin: 20 }),
			selection: { anchor: line.from }
		})
	}

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ delay: INIT_DELAY }}
			style={{ height: 'calc(100vh - 220px)', minHeight: '600px' }}
			className={`bg-card flex flex-col relative ${
				isZenMode
					? 'w-full max-w-[900px] border-none shadow-none bg-transparent'
					: isSplitMode
						? 'flex-1 min-w-0 rounded-2xl border p-6 shadow-sm'
						: 'w-[800px] rounded-[40px] border p-6 shadow'
			}`}
			onKeyDown={handleKeyDown}
			onPaste={handlePaste}>
			
			{/* Floating dynamic TOC navigation */}
			<WriteEditorToc
				markdown={form.md}
				activeLine={activeLine}
				onHeadingClick={handleHeadingClick}
			/>

			<div className='mb-3 flex gap-3'>
				<input
					type='text'
					placeholder='标题'
					className='bg-card flex-1 rounded-lg border px-3 py-2 text-sm'
					value={form.title}
					onChange={e => updateForm({ title: e.target.value })}
				/>
				<input
					type='text'
					placeholder='slug（xx-xx）'
					className='bg-card w-[200px] rounded-lg border px-3 py-2 text-sm'
					value={form.slug}
					onChange={e => updateForm({ slug: e.target.value })}
				/>
			</div>
			
			<div className="flex-1 min-h-0 w-full rounded-xl border bg-card/15 overflow-hidden">
				<CodeMirror
					value={form.md}
					height="100%"
					className="h-full w-full"
					theme="none"
					onCreateEditor={(view) => {
						viewRef.current = view
					}}
					extensions={[
						markdown(),
						EditorView.lineWrapping,
						keymap.of([indentWithTab]),
						customTheme,
						updateListener
					]}
					onChange={(val) => {
						const updates: any = { md: val }
						
						// Auto extract title from first H1 if title is empty
						const h1Match = val.match(/^#\s+(.+)$/m)
						if (h1Match && h1Match[1]) {
							const extractedTitle = h1Match[1].trim()
							if (!form.title) {
								updates.title = extractedTitle
							}
						}
						
						updateForm(updates)
					}}
				/>
			</div>
			
			<WriteStats />
		</motion.div>
	)
}
