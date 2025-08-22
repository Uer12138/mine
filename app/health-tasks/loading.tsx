import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function HealthTasksLoading() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white shadow-sm border-b border-mint/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 总体进度骨架 */}
        <Card className="mb-8 border-mint/20">
          <CardHeader className="text-center">
            <Skeleton className="h-6 w-32 mx-auto mb-2" />
            <Skeleton className="h-4 w-40 mx-auto" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-3 w-full mb-4" />
            <Skeleton className="h-8 w-16 mx-auto" />
          </CardContent>
        </Card>

        {/* 阶段任务骨架 */}
        {[1, 2, 3].map((i) => (
          <Card key={i} className="mb-8 border-mint/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-2 w-full mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="flex items-start gap-3 p-4 rounded-lg border bg-white">
                    <Skeleton className="w-5 h-5 rounded-full mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  )
}
