import Link from 'next/link';

export default function BookIndex() {
	return (
		<div className="min-h-screen px-4 py-8">
			<h1 className="text-3xl font-bold mb-6">Book</h1>
			<p className="text-gray-700 mb-6">Choose a booking option below.</p>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Link href="/book/classes" className="block p-6 rounded-2xl border border-blue-100 shadow hover:shadow-md transition">
					<h2 className="text-xl font-semibold mb-2">Classes</h2>
					<p className="text-gray-600">Reserve a spot in upcoming classes.</p>
				</Link>
				<Link href="/book/privates" className="block p-6 rounded-2xl border border-blue-100 shadow hover:shadow-md transition">
					<h2 className="text-xl font-semibold mb-2">Private Lessons</h2>
					<p className="text-gray-600">Book a one-on-one or semi-private lesson.</p>
				</Link>
			</div>
		</div>
	);
} 