import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface BlogGridCardProps {
  slug: string
  title: string
  description?: string
  date: string
  cover?: string
  showRightBorder?: boolean
  editMode?: boolean
  isSelected?: boolean
  onClick?: (e: React.MouseEvent) => void
  status?: 'draft' | 'published'
}

export function BlogGridCard({
  slug,
  title,
  description,
  date,
  cover,
  showRightBorder = true,
  editMode,
  isSelected,
  onClick,
  status
}: BlogGridCardProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      onClick={(e) => {
        if (editMode) {
          e.preventDefault()
          onClick?.(e)
        }
      }}
      className={cn(
        "group block relative bg-white rounded-2xl border transition-shadow overflow-hidden",
        editMode 
          ? (isSelected ? "border-neutral-900 shadow-md ring-1 ring-neutral-900" : "border-neutral-200 hover:border-neutral-400")
          : "border-neutral-100 shadow-sm hover:shadow-md"
      )}
    >
      {editMode && (
        <div className="absolute top-4 right-4 z-20">
          <span
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full border bg-white shadow-sm transition-colors',
              isSelected ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-[#D9D9D9] text-transparent'
            )}>
            <Check className="w-4 h-4" />
          </span>
        </div>
      )}
      <div className="flex flex-col h-full">
        {cover && (
          <div className="relative w-full h-48 overflow-hidden bg-neutral-100">
            <img
              src={cover}
              alt={title || slug}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        <div className="p-6 flex flex-col gap-3 flex-grow">
          <h3 className="text-xl font-bold text-neutral-900 group-hover:text-neutral-600 transition-colors line-clamp-2">
            {title || slug}
          </h3>
          {description && (
            <p className="text-neutral-500 text-sm line-clamp-3 leading-relaxed">
              {description}
            </p>
          )}
          <div className="mt-auto pt-4 flex items-center justify-between">
            <time className="block text-xs font-semibold uppercase tracking-widest text-neutral-400">
              {date}
            </time>
            {status === 'draft' && (
              <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-bold tracking-wide">
                草稿
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
