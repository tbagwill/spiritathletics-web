'use client';

export default function Tryouts() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,254,0.9), rgba(65,105,225,0.8), rgba(0,0,0,0.7))' }}></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-6 h-6 rounded-full animate-float bg-blue-400"></div>
        <div className="absolute top-40 right-20 w-4 h-4 bg-white rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-5 h-5 bg-blue-300 rounded-full animate-float-slow"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center px-6 py-3 mb-6 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 animate-fade-in-up">
            <span className="text-white font-semibold text-lg">🏆 2025-26 Season Tryouts</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up delay-200">
            <span className="text-white">Join Our</span>
            <br />
            <span style={{ background: 'linear-gradient(45deg, #FFFFFF, #FEF2F2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Championship Team
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-300">
            Tryouts for the 2025-26 season are coming soon! Join Spirit Athletics and become part of our winning tradition.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 animate-fade-in-up delay-500">
            <button 
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
              onClick={() => window.location.href = 'https://portal.iclasspro.com/spiritathletics7750/dashboard'}
            >
              Register for Tryouts
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Important Dates */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 animate-fade-in-up">
            <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              2025-2026 Placements Schedule
            </span>
          </h2>
          
          {/* Fees and Key Info */}
          <div className="bg-gradient-to-br from-blue-50 to-gray-50 p-8 rounded-2xl border border-blue-100 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Fee Structure */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m-3-2a5 5 0 0110 0" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Placement Fees</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-gray-700">Clinic + Tryout</span>
                    <span className="font-bold text-blue-600 text-lg">$65</span>
                  </div>
                  <div className="text-sm text-gray-600 ml-3">
                    $35 Clinic Fee + $30 Tryout Fee
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Tryout Only</span>
                    <span className="font-bold text-gray-600 text-lg">$50</span>
                  </div>
                  <div className="text-sm text-gray-600 ml-3">
                    For athletes not attending clinics
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4 italic">More details available in FAQ sheet</p>
              </div>

              {/* Key Dates */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4" style={{ background: 'linear-gradient(135deg, #000000, #333333)' }}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Important Dates</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-gray-800">Clinic Week</p>
                    <p className="text-blue-600 font-bold text-lg">June 3rd - 5th</p>
                    <p className="text-sm text-gray-600">Skill building sessions</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Tryout Day</p>
                    <p className="text-blue-600 font-bold text-lg">June 7th</p>
                    <p className="text-sm text-gray-600">Team placement evaluations</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Results</p>
                    <p className="text-blue-600 font-bold text-lg">June 8th</p>
                    <p className="text-sm text-gray-600"></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Schedule */}
          <div className="bg-gradient-to-br from-blue-50 to-gray-50 p-8 rounded-2xl border border-blue-100">
            <h3 className="text-3xl font-bold text-center mb-8 text-gray-800">Detailed Tryout Schedule</h3>
            <p className="text-center text-gray-600 mb-8">All activities at Spirit Athletics - 17537 Outer Bear Valley Rd, Hesperia, CA 92345</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Tryout Clinics */}
              <div className="space-y-6">
                <h4 className="text-2xl font-bold text-blue-600 mb-4 text-center">Tryout Clinics</h4>
                
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h5 className="text-lg font-bold text-gray-800 mb-3">June 3rd - New/Level 1</h5>
                  <div className="space-y-2 text-gray-600">
                    <p><strong>Ages 5-9:</strong> 5:00PM - 6:30PM</p>
                    <p><strong>Ages 10-18:</strong> 6:45PM - 8:45PM</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h5 className="text-lg font-bold text-gray-800 mb-3">June 4th - Levels 2/3</h5>
                  <div className="space-y-2 text-gray-600">
                    <p><strong>Ages 6-8:</strong> 5:00PM - 6:30PM</p>
                    <p><strong>Ages 9-18:</strong> 6:45PM - 8:45PM</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h5 className="text-lg font-bold text-gray-800 mb-3">June 5th - Levels 4/5/6</h5>
                  <div className="space-y-2 text-gray-600">
                    <p><strong>All Ages:</strong> 6:00PM - 8:30PM</p>
                  </div>
                </div>
              </div>

              {/* Actual Tryouts */}
              <div className="space-y-6">
                <h4 className="text-2xl font-bold text-blue-600 mb-4 text-center">June 7th - Tryouts</h4>
                
                <div className="bg-white p-6 rounded-xl shadow-md border-2 border-blue-200">
                  <h5 className="text-lg font-bold text-gray-800 mb-3">Tryout Day Schedule</h5>
                  <div className="space-y-2 text-gray-600">
                    <p><strong>Ages 4-6:</strong> 1:00PM - 2:00PM</p>
                    <p><strong>Ages 6-9:</strong> 2:00PM - 4:00PM</p>
                    <p><strong>Ages 10-18:</strong> 4:00PM - 6:00PM</p>
                  </div>
                  <p className="mt-4 text-sm text-blue-600 font-medium">Athletes may come anytime within their time slot</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h5 className="text-lg font-bold text-gray-800 mb-3">Parent Meeting - Sunday, June 8th</h5>
                  <div className="space-y-2 text-gray-600">
                    <p><strong>Returning Families:</strong> 5:30PM - 6:50PM</p>
                    <p><strong>New Families:</strong> 6:45PM - 8:00PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Levels */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 animate-fade-in-up">
            <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Tryout Program Levels
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-fade-in-up delay-100">
              <div className="w-16 h-16 mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Non-Competitive</h3>
              <p className="text-sm text-gray-600 mb-3">Ages 4-16 • Once per week</p>
              <p className="text-sm text-gray-600">Perfect for beginners and those wanting a fun, supportive environment</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-fade-in-up delay-200">
              <div className="w-16 h-16 mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4169E1, #0000FE)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Novice</h3>
              <p className="text-sm text-gray-600 mb-3">Ages 4-14 • Once per week</p>
              <p className="text-sm text-gray-600">Introduction to competitive cheerleading with local travel only</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-fade-in-up delay-300">
              <div className="w-16 h-16 mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4169E1, #000000)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Prep</h3>
              <p className="text-sm text-gray-600 mb-3">Ages 5-18 • 1-2x per week</p>
              <p className="text-sm text-gray-600">Beginner/intermediate competitive program with limited travel</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-fade-in-up delay-400">
              <div className="w-16 h-16 mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #000000, #333333)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Elite All-Star</h3>
              <p className="text-sm text-gray-600 mb-3">Ages 5-18 • 2-3x per week</p>
              <p className="text-sm text-gray-600">Premier competitive program with full travel including East Coast</p>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 animate-fade-in-up">
            <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              What to Expect at Tryouts
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Skills Assessment</h3>
                    <p className="text-gray-600">Evaluation of tumbling, stunting, jumping, and dance abilities appropriate for your age and experience level.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1" style={{ background: 'linear-gradient(135deg, #4169E1, #0000FE)' }}>
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Learn a Routine</h3>
                    <p className="text-gray-600">Coaches will teach a short routine that showcases your ability to learn choreography and perform with confidence.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1" style={{ background: 'linear-gradient(135deg, #000000, #333333)' }}>
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Team Placement</h3>
                    <p className="text-gray-600">Based on your skills and goals, our coaches will recommend the best program level for your success and growth.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="animate-fade-in-up delay-200">
              <div className="bg-gradient-to-br from-blue-50 to-gray-50 p-8 rounded-2xl border border-blue-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">What to Bring</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#0000FE' }}></div>
                    Athletic clothing you can move freely in
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#0000FE' }}></div>
                    Clean athletic shoes (cheer shoes preferred)
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#0000FE' }}></div>
                    Hair pulled back and secured, high ponytail or bun
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#0000FE' }}></div>
                    Water bottle and positive attitude
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#0000FE' }}></div>
                    Completed forms & Parent Portal Registration
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* Contact & Registration */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1, #000000)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6 animate-fade-in-up">
            Ready to Join Our Championship Team?
          </h2>
          <p className="text-xl text-gray-200 mb-8 leading-relaxed animate-fade-in-up delay-200">
            Don&apos;t miss your chance to be part of Spirit Athletics!
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 animate-fade-in-up delay-300">
            <h3 className="text-2xl font-bold text-white mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
              <div>
                <p className="font-semibold mb-2">📞 Phone</p>
                <p className="text-gray-200">(760) 947-7130</p>
              </div>
              <div>
                <p className="font-semibold mb-2">📧 Email</p>
                <p className="text-gray-200">hdcspirit@aol.com</p>
              </div>
            </div>
          </div>

          
        </div>
      </section>
    </div>
  );
} 