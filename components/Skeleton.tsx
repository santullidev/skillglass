interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-surface-container-high/40 rounded-sm ${className}`} 
      aria-hidden="true"
    />
  )
}

export function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="aspect-4/5 w-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}

export function CollectionSkeleton() {
  return (
    <div className="relative aspect-4/5 w-full border border-outline-variant/10">
      <Skeleton className="absolute inset-0" />
      <div className="absolute bottom-8 left-0 right-0 p-8 flex flex-col items-center gap-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  )
}
