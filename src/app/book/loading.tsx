export default function Loading() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-100 to-gray-100 animate-pulse"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <div className="h-12 w-64 bg-gray-300 rounded-lg mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 w-96 bg-gray-200 rounded-lg mx-auto animate-pulse"></div>
        </div>
      </section>

      {/* Content Skeleton */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Tabs Skeleton */}
          <div className="flex gap-4 mb-8 justify-center">
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Cards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 animate-pulse">
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 w-full bg-gray-100 rounded mb-2"></div>
                <div className="h-4 w-5/6 bg-gray-100 rounded mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="h-10 w-full bg-blue-100 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
} 