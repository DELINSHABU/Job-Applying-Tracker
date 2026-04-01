import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';

export function StatsCardSkeleton() {
  return (
    <Card className="min-w-[140px] bg-white dark:bg-card-bg rounded-2xl border-slate-200 dark:border-card-border flex-shrink-0">
      <CardContent className="p-4">
        <Skeleton className="w-6 h-6 rounded mb-2" />
        <Skeleton className="h-8 w-12 mb-1" />
        <Skeleton className="h-4 w-20" />
      </CardContent>
    </Card>
  );
}

export function StatsCardsSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 px-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DesktopStatsCardSkeleton() {
  return (
    <Card className="bg-white/50 dark:bg-card-bg/50 backdrop-blur-sm rounded-3xl border-slate-200 dark:border-card-border">
      <CardContent className="p-6">
        <Skeleton className="w-12 h-12 rounded-2xl mb-4" />
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-9 w-16 mb-2" />
        <Skeleton className="h-4 w-28" />
      </CardContent>
    </Card>
  );
}

export function DesktopStatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <DesktopStatsCardSkeleton key={i} />
      ))}
    </div>
  );
}
