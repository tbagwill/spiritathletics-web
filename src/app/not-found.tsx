import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        
        <p className="text-gray-600 mb-6">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        
        <div className="space-y-3">
          <Link
            href="/shop"
            className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Visit Shop
          </Link>
          
          <Link
            href="/"
            className="block w-full px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Looking for something specific?</strong>
            <br />
            Try our main navigation or contact us for help.
          </p>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Page Not Found - Spirit Athletics',
  description: 'The page you are looking for could not be found.'
};
