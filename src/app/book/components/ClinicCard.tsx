import { formatPt } from '@/lib/time';
import RegisterClinicDialog from './RegisterClinicDialog';

interface ClinicRegistration {
  id: string;
  athleteFirstName: string;
}

interface ClinicCardProps {
  clinic: {
    id: string;
    title: string;
    description: string;
    dateTimeUTC: string;
    durationMinutes: number;
    priceCents: number;
    capacity: number;
    location?: string | null;
    imageUrl?: string | null;
    isFeatured: boolean;
    registrations: ClinicRegistration[];
  };
}

export default function ClinicCard({ clinic }: ClinicCardProps) {
  const spotsLeft = clinic.capacity - clinic.registrations.length;
  const spotsPercent = Math.round((clinic.registrations.length / clinic.capacity) * 100);
  const when = formatPt(new Date(clinic.dateTimeUTC), "EEE, MMM d, yyyy • h:mm a 'PT'");
  const durationHours = Math.floor(clinic.durationMinutes / 60);
  const durationMins = clinic.durationMinutes % 60;
  const durationLabel = durationHours > 0
    ? `${durationHours}h${durationMins > 0 ? ` ${durationMins}m` : ''}`
    : `${durationMins}m`;

  const athleteNames = clinic.registrations.map((r) => r.athleteFirstName);

  return (
    <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-xl group">
      {/* Featured badge */}
      {clinic.isFeatured && (
        <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
          ⭐ Featured Event
        </div>
      )}

      {/* Image or gradient header */}
      {clinic.imageUrl ? (
        <div className="h-44 relative overflow-hidden">
          <img src={clinic.imageUrl} alt={clinic.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent" />
        </div>
      ) : (
        <div className="h-20 bg-gradient-to-r from-purple-600 to-indigo-600" />
      )}

      <div className="p-5">
        {/* Title & meta */}
        <h3 className="text-xl font-bold text-gray-900 mb-1">{clinic.title}</h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {when}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {durationLabel}
          </span>
          {clinic.location && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {clinic.location}
            </span>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">{clinic.description}</p>

        {/* Capacity bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-medium mb-1">
            <span className={spotsLeft <= 3 && spotsLeft > 0 ? 'text-amber-600 font-semibold' : 'text-gray-600'}>
              {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left` : 'Sold out'}
            </span>
            <span className="text-gray-400">{clinic.registrations.length} / {clinic.capacity} registered</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${spotsPercent >= 90 ? 'bg-red-400' : spotsPercent >= 60 ? 'bg-amber-400' : 'bg-purple-400'}`}
              style={{ width: `${Math.min(spotsPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* Registered athletes list */}
        {athleteNames.length > 0 && (
          <div className="mb-4 bg-purple-50 rounded-xl p-3">
            <p className="text-xs font-semibold text-purple-700 mb-2 uppercase tracking-wide">Registered athletes</p>
            <div className="flex flex-wrap gap-1.5">
              {athleteNames.map((name, i) => (
                <span key={i} className="text-xs bg-white text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-medium">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Price & CTA */}
        <RegisterClinicDialog
          clinicId={clinic.id}
          clinicTitle={clinic.title}
          clinicWhen={when}
          priceCents={clinic.priceCents}
          spotsLeft={spotsLeft}
        />
      </div>
    </div>
  );
}
