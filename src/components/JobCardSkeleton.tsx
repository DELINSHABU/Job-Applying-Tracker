import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';

export function JobCardSkeleton() {
  return (
    <Card className="bg-white dark:bg-card-bg rounded-2xl border-slate-200 dark:border-card-border">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        
        <div className="grid grid-cols-2 gap-y-3 mt-4 border-t border-slate-100 dark:border-card-border pt-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-card-border">
          <Skeleton className="flex-1 h-9 rounded-lg" />
          <Skeleton className="flex-1 h-9 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

export function JobListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <main className="px-5 mt-6 space-y-4 pb-24">
      <div className="flex justify-between items-center mb-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-5 w-16" />
      </div>
      
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </main>
  );
}
