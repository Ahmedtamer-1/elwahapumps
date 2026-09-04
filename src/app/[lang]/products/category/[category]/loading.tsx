export default function CategoryLoading() {
  return (
    <div className="flex flex-col md:flex-row rtl:flex-row-reverse min-h-screen bg-white">
      {/* Sidebar Skeleton */}
      <aside className="w-full md:w-72 lg:w-80 bg-[#3f3f3f] shrink-0 p-6 pt-24 md:p-10 md:pt-32 flex flex-col md:min-h-screen">
        <div className="w-32 h-4 bg-neutral-600 animate-pulse rounded mb-8"></div>
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <div className="w-48 h-8 bg-neutral-600 animate-pulse rounded"></div>
        </div>
        
        <div className="hidden md:flex flex-col">
          <div className="w-24 h-8 bg-neutral-600 animate-pulse rounded mb-10"></div>
          <div className="w-16 h-4 bg-neutral-600 animate-pulse rounded mb-6"></div>
          
          <div className="flex flex-col gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="w-20 h-5 bg-neutral-600 animate-pulse rounded mb-1"></div>
                <div className="h-px w-full bg-neutral-500/50 mb-2"></div>
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 bg-neutral-600 animate-pulse rounded-sm"></div>
                    <div className="w-24 h-4 bg-neutral-600 animate-pulse rounded"></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Area Skeleton */}
      <main className="flex-1 bg-white p-6 pt-24 md:p-12 md:pt-32 lg:p-20 lg:pt-32">
        <div className="max-w-5xl mx-auto flex flex-col gap-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col md:flex-row rtl:md:flex-row-reverse gap-8 items-center md:items-start border-b border-neutral-200 pb-12 w-full">
              {/* Product Image */}
              <div className="w-full md:w-72 aspect-[4/3] bg-neutral-100 animate-pulse shrink-0"></div>
              
              {/* Product Info */}
              <div className="flex-1 flex flex-col pt-2 w-full rtl:md:pl-4 ltr:md:pr-4">
                <div className="w-3/4 h-7 bg-neutral-200 animate-pulse rounded mb-1"></div>
                <div className="w-1/3 h-4 bg-neutral-200 animate-pulse rounded mb-4"></div>
                
                <div className="flex flex-col gap-2 mt-2">
                  <div className="w-1/2 h-4 bg-neutral-200 animate-pulse rounded"></div>
                  <div className="w-1/2 h-4 bg-neutral-200 animate-pulse rounded"></div>
                  <div className="w-1/2 h-4 bg-neutral-200 animate-pulse rounded"></div>
                </div>

                <div className="w-32 h-6 bg-neutral-200 animate-pulse rounded mt-6"></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
