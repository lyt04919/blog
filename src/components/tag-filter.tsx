'use client'

import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useMemo } from 'react'

interface TagFilterProps {
  tags: string[]
  selectedTag: string
  tagCounts?: Record<string, number>
  onSelectTag: (tag: string) => void
}

export function TagFilter({ tags, selectedTag, tagCounts, onSelectTag }: TagFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const sortedTags = useMemo(() => {
    const allTag = tags.find(t => t === 'All')
    const otherTags = tags.filter(t => t !== 'All').sort((a, b) => {
      const countA = tagCounts?.[a] || 0
      const countB = tagCounts?.[b] || 0
      return countB - countA
    })
    return allTag ? [allTag, ...otherTags] : otherTags
  }, [tags, tagCounts])

  const TagButton = ({ tag }: { tag: string }) => (
    <button
      onClick={() => {
        onSelectTag(tag)
      }}
      className={cn(
        "h-8 flex items-center px-1 pl-3 rounded-full cursor-pointer border text-sm transition-colors whitespace-nowrap shrink-0",
        selectedTag === tag
          ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
          : "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600"
      )}
    >
      <span className="font-medium">{tag}</span>
      {tagCounts?.[tag] !== undefined && (
        <span
          className={cn(
            "ml-2 text-[10px] border rounded-full h-5 min-w-5 font-semibold flex items-center justify-center",
            selectedTag === tag
              ? "border-neutral-700 bg-neutral-800 text-neutral-100"
              : "border-neutral-200 bg-neutral-100 text-neutral-500"
          )}
        >
          {tagCounts[tag]}
        </span>
      )}
    </button>
  )

  const needsExpansion = sortedTags.length > 6 // Show arrow only if there are enough tags to likely wrap

  return (
    <>
      {/* Desktop Filter */}
      <div className="hidden md:flex flex-col items-center w-full relative">
        <div 
          className="flex flex-wrap gap-y-3 gap-x-2 w-full overflow-hidden transition-all duration-500 ease-in-out"
          style={{ maxHeight: isExpanded ? '1000px' : '32px' }}
        >
          {sortedTags.map((tag) => (
            <TagButton key={tag} tag={tag} />
          ))}
        </div>

        {needsExpansion && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 flex items-center justify-center w-8 h-8 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-400 hover:text-neutral-900 transition-colors shadow-sm cursor-pointer z-20"
          >
            <ChevronDown className={cn("w-4 h-4 transition-transform duration-500", isExpanded ? "rotate-180" : "")} />
          </button>
        )}
      </div>

      {/* Mobile Filter (Native Select wrapping) */}
      <div className="md:hidden relative w-full">
        <select
          value={selectedTag}
          onChange={(e) => onSelectTag(e.target.value)}
          className="w-full appearance-none bg-white border border-neutral-200 rounded-lg px-4 py-3 text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900 shadow-sm"
        >
          {sortedTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag} {tagCounts?.[tag] !== undefined ? `(${tagCounts[tag]})` : ''}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-neutral-400" />
      </div>
    </>
  )
}
