export default function ProductDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column - Gallery Skeleton */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <div className="rounded-2xl mb-4 aspect-square bg-surface-container animate-pulse shadow-sm"></div>
            
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-20 h-20 rounded-xl flex-shrink-0 bg-surface-container animate-pulse border-2 border-outline-variant"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Details & Variants Skeleton */}
        <div className="lg:col-span-7">
          <div className="mb-6">
            <div className="w-24 h-6 bg-surface-container animate-pulse rounded mb-3"></div>
            <div className="w-3/4 h-10 bg-surface-container animate-pulse rounded mb-4"></div>
            <div className="w-32 h-5 bg-surface-container animate-pulse rounded mb-6"></div>

            <div className="w-40 h-8 bg-surface-container animate-pulse rounded mb-4"></div>
            
            <div className="space-y-3 mt-6">
              <div className="w-full h-4 bg-surface-container animate-pulse rounded"></div>
              <div className="w-full h-4 bg-surface-container animate-pulse rounded"></div>
              <div className="w-5/6 h-4 bg-surface-container animate-pulse rounded"></div>
              <div className="w-4/6 h-4 bg-surface-container animate-pulse rounded"></div>
            </div>
          </div>

          <div className="h-px w-full bg-outline-variant/30 my-8"></div>

          {/* Supplier Info & CTAs Skeleton */}
          <div className="glass-card p-6 rounded-2xl bg-surface-container-lowest">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-outline-variant/30">
              <div className="w-14 h-14 bg-surface-container animate-pulse rounded-xl"></div>
              <div className="flex flex-col gap-2 w-1/3">
                <div className="w-full h-5 bg-surface-container animate-pulse rounded"></div>
                <div className="w-2/3 h-4 bg-surface-container animate-pulse rounded"></div>
              </div>
            </div>

            <div className="w-full h-14 bg-surface-container animate-pulse rounded-xl mb-4"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="w-full h-14 bg-surface-container animate-pulse rounded-xl"></div>
              <div className="w-full h-14 bg-surface-container animate-pulse rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
