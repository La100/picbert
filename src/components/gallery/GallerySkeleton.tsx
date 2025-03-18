import { Skeleton } from "@/components/ui/skeleton"

export function GallerySkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="relative overflow-hidden rounded-lg aspect-[9/16]">
              <Skeleton className="w-full h-full" />
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-10" />
          ))}
        </div>
      </div>
    </div>
  )
} 