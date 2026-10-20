export function SkeletonCard({ className = '' }) {
  return (
    <div className={`card animate-pulse ${className}`}>
      <div className="h-4 skeleton rounded w-1/3 mb-3" />
      <div className="h-8 skeleton rounded w-2/3 mb-2" />
      <div className="h-3 skeleton rounded w-1/2" />
    </div>
  )
}

export function SkeletonList({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 skeleton rounded-full flex-shrink-0" />
          <div className="flex-1">
            <div className="h-3.5 skeleton rounded w-1/3 mb-2" />
            <div className="h-3 skeleton rounded w-1/2" />
          </div>
          <div className="h-4 skeleton rounded w-16" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3.5 skeleton rounded flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 skeleton rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}
