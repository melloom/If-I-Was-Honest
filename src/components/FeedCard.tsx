'use client'

import React, { memo, useMemo } from 'react'

interface PublishedEntry {
  id: string
  content: string
  publishedAt: string
  to?: string
  from?: string
  moods: {
    name: string
    color: string | null
  }[]
  userId?: string
  status?: string
}

interface StatusOption {
  value: string
  label: string
  emoji: string
  color: string
  textColor: string
}

interface FeedCardProps {
  entry: PublishedEntry
  isDesktop: boolean
  mounted: boolean
  userId?: string
  statusOptions: StatusOption[]
  statusDropdownOpen: string | null
  onCardClick: (entry: PublishedEntry) => void
  onStatusDropdownToggle: (entryId: string | null) => void
  onStatusChange: (entryId: string, status: string) => void
}

// Utility functions - computed once per entry ID (pure functions)
const computeCardColor = (entryId: string): string => {
  const colors = [
    '#FFE5E5', '#FFE5CC', '#FFF4CC', '#E5F9E5', '#E5F4FF', '#F0E5FF',
    '#FFE5F4', '#E5FFF9', '#FFF0E5', '#F4E5FF', '#E5FFE5', '#FFE5EB',
  ]
  let hash = 0
  for (let i = 0; i < entryId.length; i++) {
    hash = entryId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const computeRotation = (id: string): number => {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (id.charCodeAt(i) + ((hash << 5) - hash)) | 0
  }
  return ((Math.abs(hash) % 100) - 50) / 10
}

const computeOffset = (id: string, axis: 'x' | 'y'): number => {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (id.charCodeAt(i) * (axis === 'x' ? 7 : 13) + ((hash << 3) - hash)) | 0
  }
  return ((Math.abs(hash) % 17) - 8)
}

const computeTapePosition = (id: string, side: 'left' | 'right') => {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (id.charCodeAt(i) * (side === 'left' ? 17 : 23) + ((hash << 4) - hash)) | 0
  }
  const absHash = Math.abs(hash)
  
  // Ensure left tape is on top/left edges (0 or 2), right tape on bottom/right edges (1 or 3)
  // This prevents tapes from overlapping or being too close
  let location: number
  if (side === 'left') {
    location = absHash % 2 === 0 ? 0 : 2 // top (0) or left side (2)
  } else {
    location = absHash % 2 === 0 ? 1 : 3 // bottom (1) or right side (3)
  }
  
  // Position along the edge - spread out more (15-35% range)
  const position = 15 + (absHash % 21)
  const rotation = ((absHash % 10) - 5) // -5 to +5 degrees
  const width = 20 + (absHash % 8) // 20-28px
  return { position: `${position}%`, rotation, width, location }
}

const computeCreasePosition = (id: string, index: number) => {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (id.charCodeAt(i) * (index * 17) + ((hash << 6) - hash)) | 0
  }
  const absHash = Math.abs(hash)
  const top = index === 1 ? 25 + (absHash % 16) : 50 + (absHash % 16)
  const left = 2 + (absHash % 8)
  const width = 80 + (absHash % 16)
  const rotation = ((absHash % 8) - 4) / 2
  const opacity = 0.6 + (absHash % 20) / 100
  return { top: `${top}%`, left: `${left}%`, width: `${width}%`, rotation, opacity }
}

function formatTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

// Memoized card component - only re-renders when its specific props change
const FeedCard = memo(function FeedCard({
  entry,
  isDesktop,
  mounted,
  userId,
  statusOptions,
  statusDropdownOpen,
  onCardClick,
  onStatusDropdownToggle,
  onStatusChange,
}: FeedCardProps) {
  // Memoize all computed values based on entry.id
  const cardStyles = useMemo(() => {
    const cardColor = computeCardColor(entry.id)
    const rotation = computeRotation(entry.id)
    const offsetX = isDesktop ? computeOffset(entry.id, 'x') : 0
    const offsetY = isDesktop ? computeOffset(entry.id, 'y') : 0
    const leftTape = computeTapePosition(entry.id, 'left')
    const rightTape = computeTapePosition(entry.id, 'right')
    const crease1 = computeCreasePosition(entry.id, 1)
    const crease2 = computeCreasePosition(entry.id, 2)

    return {
      cardColor,
      rotation,
      offsetX,
      offsetY,
      leftTape,
      rightTape,
      crease1,
      crease2,
    }
  }, [entry.id, isDesktop])

  const preview = useMemo(() => {
    return entry.content.length > 120
      ? entry.content.substring(0, 120).trim()
      : entry.content
  }, [entry.content])

  const hasMore = entry.content.length > 120
  const primaryMood = entry.moods[0]?.name || null
  const timeAgo = mounted ? formatTimeAgo(entry.publishedAt) : ''
  const statusOption = statusOptions.find(s => s.value === entry.status) || statusOptions[0]

  const { cardColor, rotation, offsetX, offsetY, leftTape, rightTape, crease1, crease2 } = cardStyles

  // Simplified tape component for cleaner rendering
  const TapeElement = useMemo(() => {
    const tapeStyle = {
      background: 'linear-gradient(135deg, rgba(255,240,120,0.75) 0%, rgba(255,230,95,0.85) 50%, rgba(255,240,120,0.75) 100%)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.6), inset 0 -2px 0 rgba(0,0,0,0.15)',
      border: '1px solid rgba(210,190,50,0.5)',
      borderRadius: '2px',
    }

    const renderTape = (tape: typeof leftTape, isLeft: boolean) => {
      const isHorizontal = tape.location === 0 || tape.location === 1
      const baseStyle = {
        ...tapeStyle,
        width: isHorizontal ? `${tape.width + 20}px` : '24px',
        height: isHorizontal ? '24px' : `${tape.width + 20}px`,
        transform: `rotate(${tape.rotation}deg)`,
      }

      const positions: Record<number, React.CSSProperties> = {
        0: { top: '-8px', [isLeft ? 'left' : 'right']: tape.position },
        1: { bottom: '-8px', [isLeft ? 'left' : 'right']: tape.position },
        2: { left: '-8px', top: tape.position },
        3: { right: '-8px', top: tape.position },
      }

      return (
        <div
          className="absolute pointer-events-none z-30"
          style={{ ...baseStyle, ...positions[tape.location] }}
        />
      )
    }

    return (
      <>
        {renderTape(leftTape, true)}
        {renderTape(rightTape, false)}
      </>
    )
  }, [leftTape, rightTape])

  return (
    <div
      onClick={() => onCardClick(entry)}
      className="relative p-6 cursor-pointer transition-transform duration-200 hover:scale-105 md:hover:rotate-0 hover:z-10"
      style={{
        backgroundColor: cardColor,
        boxShadow: `${offsetX}px ${Math.abs(offsetY) + 4}px 16px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)`,
        border: '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: '2px',
        transform: isDesktop ? `rotate(${rotation}deg) translate(${offsetX}px, ${offsetY}px)` : 'none',
        overflow: 'hidden',
        willChange: 'transform',
        contain: 'layout paint',
      }}
    >
      {/* Tape elements */}
      {TapeElement}

      {/* Status badge - only show if status is not NO_STATUS */}
      {entry.status && entry.status !== 'NO_STATUS' && (
        <div className="absolute top-4 right-4 z-20">
          {entry.userId === userId ? (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onStatusDropdownToggle(statusDropdownOpen === entry.id ? null : entry.id)
                }}
                className="text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
                style={{ backgroundColor: statusOption.color, color: statusOption.textColor }}
                title="Click to change status"
              >
                <span>{statusOption.emoji}</span>
                {statusOption.label}
              </button>

              {statusDropdownOpen === entry.id && (
                <div
                  className="absolute right-0 top-full w-48 rounded-lg shadow-xl border overflow-hidden z-50"
                  style={{ backgroundColor: '#FFFFFF', borderColor: '#E0E0E0' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {statusOptions.map((status) => (
                    <button
                      key={status.value}
                      onClick={(e) => {
                        e.stopPropagation()
                        onStatusChange(entry.id, status.value)
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-2 transition-colors hover:bg-gray-100"
                      style={{
                        backgroundColor: entry.status === status.value ? status.color : '#FFFFFF',
                        color: entry.status === status.value ? status.textColor : '#4A4A4A',
                      }}
                    >
                      <span className="text-base">{status.emoji}</span>
                      <span>{status.label}</span>
                      {entry.status === status.value && <span className="ml-auto text-lg">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5"
              style={{ backgroundColor: statusOption.color, color: statusOption.textColor }}
            >
              <span>{statusOption.emoji}</span>
              {statusOption.label}
            </span>
          )}
        </div>
      )}

      {/* Paper effects - simplified for performance */}
      <div
        className="absolute inset-0 pointer-events-none rounded-sm"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.03) 100%)',
        }}
      />

      {/* Simplified paper texture */}
      <div
        className="absolute inset-0 pointer-events-none rounded-sm opacity-10"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.7\' numOctaves=\'2\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          mixBlendMode: 'multiply',
        }}
      />

      {/* Worn edges */}
      <div
        className="absolute inset-0 pointer-events-none rounded-sm"
        style={{
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)',
        }}
      />

      {/* Simplified creases */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: crease1.top,
          left: crease1.left,
          width: crease1.width,
          height: '1px',
          background: 'rgba(0,0,0,0.08)',
          transform: `rotate(${crease1.rotation}deg)`,
          opacity: crease1.opacity,
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: crease2.top,
          left: crease2.left,
          width: crease2.width,
          height: '1px',
          background: 'rgba(0,0,0,0.06)',
          transform: `rotate(${crease2.rotation}deg)`,
          opacity: crease2.opacity,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header section with To/From and timestamp */}
        <div className="mb-4">
          {/* To and From fields */}
          {(entry.to || entry.from) && (
            <div className="space-y-1 mb-2 pr-20">
              {entry.to && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide flex-shrink-0" style={{ color: '#9B9B9B' }}>
                    To:
                  </span>
                  <span className="text-sm font-semibold truncate" style={{ color: '#1A1A1A' }}>
                    {entry.to}
                  </span>
                </div>
              )}
              {entry.from && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide flex-shrink-0" style={{ color: '#9B9B9B' }}>
                    From:
                  </span>
                  <span className="text-sm font-semibold truncate" style={{ color: '#1A1A1A' }}>
                    {entry.from}
                  </span>
                </div>
              )}
            </div>
          )}
          {/* Timestamp */}
          <div className="flex items-center justify-end">
            <span className="text-xs" style={{ color: '#9B9B9B' }}>
              {timeAgo}
            </span>
          </div>
        </div>

        <p className="text-base leading-relaxed mb-3" style={{ color: '#2A2A2A', fontWeight: '500' }}>
          {preview}
          {hasMore && (
            <span className="ml-1" style={{ color: '#6B6B6B' }}>
              … read more
            </span>
          )}
        </p>

        {primaryMood && (
          <div className="flex items-center justify-end text-xs">
            <span
              className="px-3 py-1 rounded-full font-medium"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                color: '#6B6B6B',
              }}
            >
              {primaryMood}
            </span>
          </div>
        )}
      </div>
    </div>
  )
})

export default FeedCard
