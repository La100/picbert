import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function ImageConfigurationsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-[250px] mb-2" />
        <Skeleton className="h-5 w-[350px]" />
      </div>

      <div className="grid w-full max-w-2xl mx-auto items-start gap-6 xl:pt-20">
        <Card className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-[150px]" />
            <Skeleton className="h-6 w-[100px]" />
          </div>

          {/* Input Image Section */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-[100px]" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-[100px]" />
              <Skeleton className="h-10 w-[120px]" />
            </div>
          </div>

          {/* Aspect Ratio Section */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-[120px]" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Prompt Section */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-[80px]" />
            <Skeleton className="h-[150px] w-full" />
          </div>

          {/* Generate Button */}
          <Skeleton className="h-10 w-full" />
        </Card>
      </div>
    </div>
  )
} 