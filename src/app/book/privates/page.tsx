import { Suspense } from 'react';
import Link from 'next/link';
import PrivateLessonsSection from '../components/PrivateLessonsSection';

export const dynamic = 'force-dynamic';

export default async function BookPrivatesPage() {
	return (
		<div className="relative min-h-screen overflow-hidden bg-slate-50">
			{/* Decorative depth layer */}
			<div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[420px] overflow-hidden">
				<div className="absolute -top-24 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 opacity-[0.13] blur-3xl" />
			</div>

			{/* Hero */}
			<header className="relative">
				<div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-indigo-800">
					<div aria-hidden className="absolute inset-0 bg-dot-grid opacity-60" />
					<div aria-hidden className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
					<div aria-hidden className="absolute -left-10 bottom-0 h-52 w-52 rounded-full bg-violet-400/20 blur-3xl" />

					<div className="relative mx-auto max-w-5xl px-5 py-12 sm:py-16 text-center">
						<span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-50 ring-1 ring-inset ring-white/20 backdrop-blur">
							<svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
							1-on-1 Training
						</span>
						<h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-5xl">
							Book a Private Lesson
						</h1>
						<p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-blue-100/90 sm:text-lg">
							Personalized one-on-one or semi-private training, tailored to your athlete&apos;s goals and skill level.
						</p>

						{/* Segmented control */}
						<div className="mt-8 flex justify-center">
							<div className="inline-flex items-center gap-1 rounded-2xl bg-white/10 p-1.5 ring-1 ring-inset ring-white/20 backdrop-blur">
								<span className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm">
									<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
									Private
								</span>
								<Link
									href="/book/classes"
									className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-blue-50 transition-colors hover:bg-white/10"
								>
									<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
									Group Classes
								</Link>
							</div>
						</div>
					</div>
				</div>
			</header>

			{/* Content */}
			<main className="relative mx-auto max-w-5xl px-4 pb-20 sm:px-6">
				<div className="-mt-6 sm:-mt-8">
					<Suspense fallback={
						<div className="flex items-center justify-center py-20">
							<div className="text-center">
								<div className="mx-auto mb-4 h-12 w-12">
									<div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
								</div>
								<p className="font-medium text-gray-500">Loading private lesson options…</p>
							</div>
						</div>
					}>
						<PrivateLessonsSection />
					</Suspense>
				</div>
			</main>
		</div>
	);
}
