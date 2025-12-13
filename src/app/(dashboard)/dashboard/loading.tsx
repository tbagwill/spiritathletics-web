export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex-1">
              <div className="h-8 w-64 bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-5 w-96 bg-gray-100 rounded-lg"></div>
            </div>
            <div className="flex justify-center sm:justify-end">
              <div className="h-10 w-28 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-5 w-40 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-56 bg-gray-100 rounded"></div>
                </div>
                <div className="w-5 h-5 bg-gray-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

