import Link from 'next/link';

export default function BookIndex() {
  const cards = [
    {
      href: '/book/classes',
      gradient: 'from-blue-600 to-indigo-600',
      icon: (
        <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      tag: 'Group Sessions',
      title: 'Classes',
      description: 'Reserve a spot in our scheduled group classes. Browse upcoming sessions, see available spots, and pay securely online.',
      cta: 'Browse Classes',
      features: ['Upcoming schedule', 'Instant confirmation', 'Secure payment'],
    },
    {
      href: '/book/privates',
      gradient: 'from-slate-700 to-slate-900',
      icon: (
        <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      tag: '1-on-1 Training',
      title: 'Private Lessons',
      description: 'Book a dedicated one-on-one or semi-private session with one of our coaches at a time that works for you.',
      cta: 'Book a Private',
      features: ['Solo or semi-private', 'Choose your time', '30, 45, or 60 min'],
    },
    {
      href: '/book/classes#clinics',
      gradient: 'from-purple-600 to-indigo-600',
      icon: (
        <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      tag: 'Special Events',
      title: 'Clinics',
      description: 'Join our featured clinics and special training events. Limited spots available — register early to secure your place!',
      cta: 'View Clinics',
      features: ['Featured events', 'Limited spots', 'Public registrant list'],
      badge: 'New',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,254,0.9), rgba(0,0,0,0.75), rgba(65,105,225,0.85))' }} />
        </div>
        <div className="absolute top-16 left-8 w-5 h-5 rounded-full bg-blue-400 opacity-60 animate-float" />
        <div className="absolute top-32 right-16 w-4 h-4 bg-white rounded-full opacity-40 animate-float-delayed" />
        <div className="absolute bottom-16 left-1/3 w-3 h-3 bg-indigo-300 rounded-full opacity-50 animate-float-slow" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block bg-white/10 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4 border border-white/20 backdrop-blur-sm">
            Online Booking
          </span>
          <h1 className="text-5xl md:text-6xl font-bold mb-5">
            <span style={{ background: 'linear-gradient(45deg, #FFFFFF, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Book with
            </span>
            <br />
            <span className="text-white">Spirit Athletics</span>
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Choose your session type below. All bookings are confirmed instantly with secure online payment.
          </p>
        </div>
      </section>

      {/* Trust bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            {[
              { icon: '🔒', text: 'Secure Stripe payments' },
              { icon: '📧', text: 'Instant email confirmation' },
              { icon: '📅', text: 'Calendar invite included' },
              { icon: '❌', text: 'Cancel up to 4 hrs before' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-1.5">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking cards */}
      <section className="py-16 px-4" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0, #f1f5f9)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div
                key={card.href}
                className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-100"
              >
                {card.badge && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10">
                    {card.badge}
                  </div>
                )}

                {/* Color top */}
                <div className={`h-2 bg-gradient-to-r ${card.gradient}`} />

                <div className="p-7">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    {card.icon}
                  </div>

                  {/* Tag + title */}
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.tag}</span>
                  <h2 className="text-2xl font-bold text-gray-900 mt-1 mb-3">{card.title}</h2>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">{card.description}</p>

                  {/* Feature list */}
                  <ul className="space-y-1.5 mb-6">
                    {card.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href={card.href}
                    className={`flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl text-white font-semibold transition-all duration-200 hover:scale-105 shadow-md bg-gradient-to-r ${card.gradient}`}
                  >
                    {card.cta}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help CTA */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Questions about booking?</h2>
          <p className="text-gray-500 mb-6">Our team is happy to help you find the right session for your athlete.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:frontdesk@spiritathletics.net"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-md transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Us
            </a>
            <a
              href="tel:+17609477130"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 text-gray-800 font-semibold transition-all hover:bg-gray-50"
              style={{ borderColor: '#0000FE' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
