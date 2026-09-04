export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-10 min-h-[60vh]">
      {/* Header Skeleton */}
      <div className="w-1/3 h-10 bg-surface-container animate-pulse rounded mb-8"></div>
      
      {/* Paragraph Blocks Skeleton */}
      <div className="space-y-4 mb-12">
        <div className="w-full h-4 bg-surface-container animate-pulse rounded"></div>
        <div className="w-[90%] h-4 bg-surface-container animate-pulse rounded"></div>
        <div className="w-[95%] h-4 bg-surface-container animate-pulse rounded"></div>
        <div className="w-2/3 h-4 bg-surface-container animate-pulse rounded"></div>
      </div>
      
      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-4">
            <div className="w-full aspect-[4/3] bg-surface-container animate-pulse rounded-2xl"></div>
            <div className="w-3/4 h-6 bg-surface-container animate-pulse rounded"></div>
            <div className="w-1/2 h-4 bg-surface-container animate-pulse rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
