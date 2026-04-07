'use client';

export default function Tryouts() {
  const clinicSchedule = [
    {
      date: 'June 1st',
      label: 'Level 1',
      sessions: [
        { group: 'Ages 6–9', time: '4:30 PM – 6:30 PM' },
        { group: 'Ages 10–18', time: '6:30 PM – 8:30 PM' },
      ],
    },
    {
      date: 'June 2nd',
      label: 'Levels 2 / 3',
      sessions: [
        { group: 'Ages 6–9', time: '4:30 PM – 6:30 PM' },
        { group: 'Ages 10–18', time: '6:30 PM – 8:30 PM' },
      ],
    },
    {
      date: 'June 3rd',
      label: 'Levels 4 / 5 / 6',
      sessions: [
        { group: 'All Ages', time: '6:00 PM – 8:30 PM' },
      ],
    },
  ];

  const tryoutSessions = [
    { group: 'Ages 4–6', time: '11:00 AM – 12:00 PM', note: 'Tiny division' },
    { group: 'Ages 7–10', time: '12:00 PM – 2:00 PM' },
    { group: 'Ages 11–18', time: '2:00 PM – 4:00 PM' },
  ];

  const parentMeetings = [
    { group: 'Returning Families', time: '5:30 PM – 6:30 PM' },
    { group: 'New Families', time: '6:45 PM – 8:00 PM' },
  ];

  return (
    <div className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,254,0.92), rgba(0,0,0,0.72), rgba(65,105,225,0.85))' }} />
        </div>
        <div className="absolute top-20 left-10 w-6 h-6 rounded-full bg-blue-400 opacity-60 animate-float" />
        <div className="absolute top-40 right-20 w-4 h-4 bg-white rounded-full opacity-40 animate-float-delayed" />
        <div className="absolute bottom-20 left-1/4 w-5 h-5 bg-blue-300 rounded-full opacity-40 animate-float-slow" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center px-6 py-2.5 mb-6 bg-white/15 backdrop-blur-sm rounded-full border border-white/30 animate-fade-in-up">
            <span className="text-white font-semibold text-base">🏆 2026–27 Season Placements</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-5 animate-fade-in-up delay-200">
            <span className="text-white">Join Our</span>
            <br />
            <span style={{ background: 'linear-gradient(45deg, #FFFFFF, #bfdbfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Championship Team
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed mb-3 animate-fade-in-up delay-300">
            Clinics June 1–3 · Tryouts June 6th · Results June 7th
          </p>
          <p className="text-base text-blue-200 mb-8 animate-fade-in-up delay-300">
            Spirit Athletics — 17537 Bear Valley Rd, Hesperia, CA 92345
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-500">
            <button
              className="bg-white text-blue-700 px-8 py-4 rounded-full font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
              onClick={() => window.location.href = 'https://portal.iclasspro.com/spiritathletics7750/dashboard'}
            >
              Register Now
            </button>
            <a
              href="mailto:frontdesk@spiritathletics.net"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-700 transition-all duration-300 text-center"
            >
              Questions? Email Us
            </a>
          </div>
        </div>
      </section>

      {/* ── Quick-glance Important Dates ──────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            {[
              { emoji: '📚', label: 'Clinics', value: 'June 1 – 3' },
              { emoji: '⭐', label: 'Tryouts', value: 'Saturday, June 6' },
              { emoji: '📋', label: 'Results & Parent Meetings', value: 'Sunday, June 7' },
            ].map((item) => (
              <div key={item.label} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                <div className="text-3xl mb-2">{item.emoji}</div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">{item.label}</p>
                <p className="text-xl font-bold text-blue-700">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Placement Fees ────────────────────────────────────────────── */}
      <section className="py-16 px-4" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 animate-fade-in-up">
            <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              2026–27 Placement Fees
            </span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Clinic + Tryout */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-500" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Best Value</p>
                  <h3 className="text-lg font-bold text-gray-900">Clinic + Tryout</h3>
                </div>
              </div>
              <div className="text-4xl font-extrabold text-blue-700 mb-3">$70</div>
              <div className="space-y-1.5 text-sm text-gray-600">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Clinic Fee</span>
                  <span className="font-semibold text-gray-800">$40</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Tryout Fee</span>
                  <span className="font-semibold text-gray-800">$30</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">Recommended for all athletes — clinics prepare you for tryouts</p>
            </div>

            {/* Tryout Only */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-400 to-gray-500" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #374151, #1f2937)' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">No Clinic</p>
                  <h3 className="text-lg font-bold text-gray-900">Tryout Only</h3>
                </div>
              </div>
              <div className="text-4xl font-extrabold text-gray-700 mb-3">$60</div>
              <div className="space-y-1.5 text-sm text-gray-600">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>Tryout Fee</span>
                  <span className="font-semibold text-gray-800">$60</span>
                </div>
              </div>
              <div className="mt-3 flex items-start gap-1.5">
                <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-amber-700">Excludes Tiny division (ages 4 &amp; 5)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Full Schedule ─────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 animate-fade-in-up">
            <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Full Schedule
            </span>
          </h2>

          <div className="space-y-8">
            {/* ── Clinics ── */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Tryout Clinics <span className="text-blue-600">June 1–3</span></h3>
                  <p className="text-sm text-gray-500">Prep sessions to get ready for tryout day — strongly recommended</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {clinicSchedule.map((day) => (
                  <div key={day.date} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-blue-700 text-base">{day.date}</p>
                      <span className="text-xs bg-blue-600 text-white font-semibold px-2.5 py-1 rounded-full">{day.label}</span>
                    </div>
                    <div className="space-y-2">
                      {day.sessions.map((s) => (
                        <div key={s.group} className="bg-white rounded-xl px-3 py-2 border border-blue-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{s.group}</p>
                          <p className="text-sm font-bold text-gray-800 mt-0.5">{s.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Tryouts ── */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #d97706, #b45309)' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Tryout Day — <span className="text-amber-600">Saturday, June 6th</span></h3>
                  <p className="text-sm text-gray-500">Team placement evaluations by our coaching staff</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {tryoutSessions.map((s) => (
                  <div key={s.group} className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-5 border border-amber-100">
                    <p className="font-bold text-amber-800 text-base mb-1">{s.group}</p>
                    <p className="text-xl font-bold text-amber-700">{s.time}</p>
                    {s.note && <p className="text-xs text-amber-600 mt-1">{s.note}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Parent Meetings ── */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #059669, #047857)' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Results &amp; Parent Meetings — <span className="text-green-700">Sunday, June 7th</span></h3>
                  <p className="text-sm text-gray-500">Team results announced · mandatory for all families</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {parentMeetings.map((m) => (
                  <div key={m.group} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
                    <p className="font-bold text-green-800 text-base mb-1">{m.group}</p>
                    <p className="text-xl font-bold text-green-700">{m.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── What to Expect ────────────────────────────────────────────── */}
      <section className="py-16 px-4" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 animate-fade-in-up">
            <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              What to Expect at Tryouts
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            <div className="space-y-6 animate-fade-in-up">
              {[
                { n: '1', title: 'Skills Assessment', body: 'Evaluation of tumbling, stunting, jumping, and dance abilities appropriate for your age and experience level.' },
                { n: '2', title: 'Learn a Routine', body: 'Coaches will teach a short routine showcasing your ability to learn choreography and perform with confidence.' },
                { n: '3', title: 'Team Placement', body: 'Based on skills and goals, our coaches recommend the best program level for your success and growth.' },
              ].map((step) => (
                <div key={step.n} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                    <span className="text-white font-bold text-sm">{step.n}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-800 mb-1">{step.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-blue-100 p-7 animate-fade-in-up delay-200">
              <h3 className="text-xl font-bold text-gray-800 mb-5">What to Bring</h3>
              <ul className="space-y-3">
                {[
                  'Athletic clothing you can move freely in',
                  'Clean athletic shoes (cheer shoes preferred)',
                  'Hair pulled back — high ponytail or bun',
                  'Water bottle and positive attitude',
                  'Completed forms &amp; Parent Portal registration',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span dangerouslySetInnerHTML={{ __html: item }} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Program Levels ────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 animate-fade-in-up">
            <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Program Levels
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: 'Non-Competitive', ages: 'Ages 4–16', freq: 'Once per week', desc: 'Fun, supportive environment — perfect for beginners', gradient: 'from-blue-600 to-indigo-500' },
              { title: 'Novice', ages: 'Ages 4–14', freq: 'Once per week', desc: 'Intro to competitive cheer with local travel only', gradient: 'from-indigo-600 to-blue-700' },
              { title: 'Prep', ages: 'Ages 5–18', freq: '1–2× per week', desc: 'Beginner/intermediate competitive program, limited travel', gradient: 'from-blue-800 to-indigo-800' },
              { title: 'Elite All-Star', ages: 'Ages 5–18', freq: '2–3× per week', desc: 'Premier program — full travel including East Coast', gradient: 'from-gray-800 to-gray-900' },
            ].map((lvl) => (
              <div key={lvl.title} className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up">
                <div className={`w-12 h-12 rounded-xl mb-4 bg-gradient-to-br ${lvl.gradient} flex items-center justify-center`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{lvl.title}</h3>
                <p className="text-xs text-blue-600 font-semibold mb-1">{lvl.ages} · {lvl.freq}</p>
                <p className="text-sm text-gray-500 leading-snug">{lvl.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1, #000000)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4 animate-fade-in-up">Ready to Join Our Championship Team?</h2>
          <p className="text-xl text-blue-100 mb-10 animate-fade-in-up delay-200">
            Clinics June 1–3 · Tryouts June 6 · Don&apos;t miss your spot!
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 animate-fade-in-up delay-300">
            <h3 className="text-xl font-bold text-white mb-5">Contact Us</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-blue-200 font-semibold uppercase tracking-wide">Phone</p>
                  <a href="tel:+17609477130" className="font-semibold hover:text-blue-200 transition-colors">(760) 947-7130</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-blue-200 font-semibold uppercase tracking-wide">Email</p>
                  <a href="mailto:frontdesk@spiritathletics.net" className="font-semibold hover:text-blue-200 transition-colors">frontdesk@spiritathletics.net</a>
                </div>
              </div>
            </div>
          </div>

          <button
            className="bg-white text-blue-700 px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
            onClick={() => window.location.href = 'https://portal.iclasspro.com/spiritathletics7750/dashboard'}
          >
            Register on Parent Portal
          </button>
        </div>
      </section>
    </div>
  );
}
