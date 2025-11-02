import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

function Tile({ href, title, icon, description, badge }: { href: string; title: string; icon: React.ReactNode; description: string; badge?: number }) {
	return (
		<div className="relative">
			{badge && badge > 0 && (
				<div className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
					{badge}
				</div>
			)}
			<Link href={href} className="group block">
				<div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transition-all duration-200 hover:shadow-xl hover:scale-105 hover:border-blue-300">
					<div className="flex items-center gap-4">
						<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 group-hover:from-blue-100 group-hover:to-indigo-100 group-hover:text-blue-700 transition-all duration-200">
							<div className="w-8 h-8 transition-transform duration-200 group-hover:scale-110">
								{icon}
							</div>
						</div>
						<div className="flex-1">
							<h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">{title}</h3>
							<p className="text-sm text-gray-600 mt-1">{description}</p>
						</div>
						<div className="text-gray-400 group-hover:text-blue-600 transition-colors duration-200">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
						</div>
					</div>
				</div>
			</Link>
		</div>
	);
}

// Simple inline SVG icons
const IconCalendar = (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full" strokeWidth="1.8">
		<rect x="3" y="4" width="18" height="18" rx="2" className="text-white" stroke="currentColor"/>
		<path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
	</svg>
);
const IconClock = (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full" strokeWidth="1.8">
		<circle cx="12" cy="12" r="9"/>
		<path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round"/>
	</svg>
);
const IconClass = (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full" strokeWidth="1.8">
		<path d="M3 7l9-4 9 4-9 4-9-4z"/>
		<path d="M21 10l-9 4-9-4"/>
		<path d="M12 14v6"/>
	</svg>
);
const IconGear = (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full" strokeWidth="1.8">
		<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
		<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.07a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.07a3.1 3.1 0 0 1 1.51-1 1.65 1.65 0 0 0 .33-1.82l-.06-.06A2 2 0 1 1 7.02 3.4l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.07a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06A2 2 0 1 1 20.6 7.02l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .66.39 1.26 1 1.51.33.14.69.22 1.06.22H22a2 2 0 1 1 0 4h-.07a3.1 3.1 0 0 1-1.06-.22 1.65 1.65 0 0 0-1.47.49z"/>
	</svg>
);

export default async function DashboardHome() {
	const session = await getServerSession(authOptions);
	const userId = (session as any)?.user?.id || (session as any)?.user?.sub;
	const name = (session as any)?.user?.name || 'Coach';
	
	// Get coach profile and count pending bookings
	const coach = userId ? await prisma.coachProfile.findUnique({ where: { userId } }) : null;
	// Count PENDING bookings regardless of time (they should show until approved/declined)
	const pendingCount = coach ? await prisma.booking.count({
		where: {
			status: 'PENDING',
			OR: [
				{ coachId: coach.id },
				{ service: { coachId: coach.id } },
			],
		},
	}) : 0;
	
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 animate-fade-in">
			{/* Header */}
			<div className="bg-white border-b border-gray-200 shadow-sm">
				<div className="max-w-7xl mx-auto px-6 py-8">
					<div className="animate-slide-up">
						{/* Mobile-first layout: stack vertically on small screens */}
						<div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
							<div className="flex-1">
								<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back, {name}</h1>
								<p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage your coaching schedule and preferences</p>
							</div>
							<div className="flex justify-center sm:justify-end">
								<form action="/api/auth/signout" method="post">
									<button className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:shadow-md text-sm sm:text-base">
										<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
										</svg>
										Sign Out
									</button>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="max-w-7xl mx-auto px-6 py-12">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
					<div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
						<Tile 
							href="/dashboard/availability" 
							title="Manage Availability" 
							icon={IconClock}
							description="Set your weekly schedule and availability rules"
						/>
					</div>
					<div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
						<Tile 
							href="/dashboard/classes" 
							title="Manage Classes" 
							icon={IconClass}
							description="Create and manage your class templates"
						/>
					</div>
					<div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
						<Tile 
							href="/dashboard/bookings" 
							title="Upcoming Bookings" 
							icon={IconCalendar}
							description="View your upcoming classes and private lessons"
							badge={pendingCount}
						/>
					</div>
					<div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
						<Tile 
							href="/dashboard/preferences" 
							title="Preferences" 
							icon={IconGear}
							description="Configure notifications and account settings"
						/>
					</div>
				</div>
			</div>
		</div>
	);
} 