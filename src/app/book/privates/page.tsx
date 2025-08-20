import { Suspense } from 'react';
import Link from 'next/link';
import PrivateLessonsSection from '../components/PrivateLessonsSection';

export const dynamic = 'force-dynamic';

export default async function BookPrivatesPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 animate-fade-in">
			{/* Header */}
			<div className="bg-white border-b border-gray-200 shadow-sm">
				<div className="max-w-7xl mx-auto px-6 py-8">
					<div className="flex flex-col gap-6">
						<div className="text-center">
							<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Book Private Lessons</h1>
							<p className="text-gray-600 text-lg max-w-2xl mx-auto">Get personalized one-on-one or semi-private training sessions tailored to your specific goals and skill level</p>
						</div>
						<div className="flex justify-center">
							<Link
								href="/book/classes"
								className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 hover:scale-105 hover:shadow-xl shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
							>
								<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
								</svg>
								View Group Classes Instead
							</Link>
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="max-w-7xl mx-auto px-6 py-12">
				<div className="animate-slide-up">
					<Suspense fallback={
						<div className="flex items-center justify-center py-16">
							<div className="text-center">
								<div className="w-16 h-16 mx-auto mb-4">
									<div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
								</div>
								<p className="text-gray-600 font-medium">Loading private lesson options...</p>
							</div>
						</div>
					}>
						<PrivateLessonsSection />
					</Suspense>
				</div>
			</div>
		</div>
	);
} 