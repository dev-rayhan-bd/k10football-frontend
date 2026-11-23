import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading state for the player dashboard. Mirrors the real layout (hero, chart,
 * sections + right column) so nothing jumps when data arrives, and so no
 * placeholder/sample values are ever shown while the player's data loads.
 */
const PlayerDashboardSkeleton = () => (
  <div
    role="status"
    aria-busy="true"
    aria-label="Loading dashboard"
    className="grid h-full min-h-[87vh] grid-cols-1 gap-8 xl:grid-cols-7"
  >
    {/* Left column */}
    <div className="flex flex-col gap-8 xl:col-span-5">
      {/* Hero */}
      <div className="relative flex min-h-150 w-full items-center overflow-hidden rounded-3xl bg-neutral-900 px-4 py-10 sm:px-8 md:h-screen md:px-12 md:py-0">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Skeleton className="size-24 rounded-full bg-white/10 md:size-32" />
          <Skeleton className="h-9 w-40 rounded-full bg-white/10" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-12 w-64 bg-white/15" />
            <Skeleton className="h-5 w-56 bg-white/10" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl bg-white/10" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-19 rounded-xl bg-white/10" />
            ))}
          </div>
        </div>
        <Skeleton className="absolute right-6 bottom-0 hidden h-[85%] w-[40%] rounded-t-full bg-white/5 md:block" />
      </div>

      {/* Performance chart */}
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-black/40 p-6">
        <Skeleton className="h-6 w-48 bg-white/10" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl bg-white/10" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl bg-white/5" />
      </div>

      {/* Following sections */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-black/40 p-6">
          <Skeleton className="h-6 w-40 bg-white/10" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((__, j) => (
              <Skeleton key={j} className="h-32 rounded-xl bg-white/5" />
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* Right column */}
    <div className="flex flex-col gap-4 sm:gap-6 xl:col-span-2">
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/40 p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-lg bg-white/10" />
          <Skeleton className="h-4 w-32 bg-white/10" />
        </div>
        <Skeleton className="h-3 w-full bg-white/5" />
        <Skeleton className="h-3 w-4/5 bg-white/5" />
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/40 p-6">
          <div className="mb-2 flex items-center gap-3">
            <Skeleton className="size-10 rounded-xl bg-white/10" />
            <Skeleton className="h-5 w-40 bg-white/10" />
          </div>
          {Array.from({ length: 3 }).map((__, j) => (
            <Skeleton key={j} className="h-12 rounded-xl bg-white/5" />
          ))}
        </div>
      ))}
      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/40 p-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl bg-white/5" />
        ))}
      </div>
    </div>
    <span className="sr-only">Loading dashboard…</span>
  </div>
);

export default PlayerDashboardSkeleton;
