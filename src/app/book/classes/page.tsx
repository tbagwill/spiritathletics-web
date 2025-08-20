import { Suspense } from 'react';
import Link from 'next/link';
import { generateOccurrencesNextWeeks } from '@/lib/classes';
import ClassList from '../components/ClassList';

export const dynamic = 'force-dynamic';

async function ensureOccurrences() {
	try {
		await generateOccurrencesNextWeeks(8);
	} catch {
		// noop
	}
}

export default async function BookClassesPage() {
	await ensureOccurrences();
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 animate-fade-in">
			{/* Header */}
			<div className="bg-white border-b border-gray-200 shadow-sm">
				<div className="max-w-7xl mx-auto px-6 py-8">
					<div className="flex flex-col gap-6">
						<div className="text-center">
							<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Book a Class</h1>
							<p className="text-gray-600 text-lg max-w-2xl mx-auto">Reserve your spot in upcoming classes and start your cheerleading journey with our expert coaches</p>
						</div>
						<div className="flex justify-center">
							<Link
								href="/book/privates"
								className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 hover:scale-105 hover:shadow-xl shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
							>
								<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
								Book Private Lesson Instead
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
								<p className="text-gray-600 font-medium">Loading available classes...</p>
							</div>
						</div>
					}>
						<ClassList />
					</Suspense>
				</div>
			</div>
		</div>
	);
} 