export function AdminCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-36 animate-pulse rounded-lg border border-white/10 bg-white/[0.045] p-5"
        >
          <div className="h-3 w-28 rounded-full bg-white/10" />
          <div className="mt-5 h-8 w-20 rounded-full bg-[#d7b46a]/20" />
          <div className="mt-5 h-3 w-full rounded-full bg-white/10" />
        </div>
      ))}
    </div>
  );
}

export function AdminTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-black/20">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="grid animate-pulse grid-cols-4 gap-4 border-b border-white/10 p-4 last:border-b-0"
        >
          <div className="h-4 rounded-full bg-white/10" />
          <div className="h-4 rounded-full bg-white/10" />
          <div className="h-4 rounded-full bg-white/10" />
          <div className="h-4 rounded-full bg-[#d7b46a]/20" />
        </div>
      ))}
    </div>
  );
}
