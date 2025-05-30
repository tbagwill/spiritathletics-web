import Link from 'next/link';

export default function NonCompetitiveProgram() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,254,0.9), rgba(65,105,225,0.8))' }}></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-6 h-6 rounded-full animate-float" style={{ backgroundColor: '#0000FE' }}></div>
        <div className="absolute top-40 right-20 w-4 h-4 bg-white rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-5 h-5 bg-gray-300 rounded-full animate-float-slow"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-8 animate-fade-in-up">
            <div className="flex items-center space-x-2 text-white/80">
              <Link href="/programs" className="hover:text-white transition-colors">Programs</Link>
              <span>/</span>
              <span className="text-white">Non-Competitive</span>
            </div>
          </nav>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm mb-6 animate-fade-in-up">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-in-up delay-200">
              <span className="text-white">Non-Competitive/Performance Teams</span>
            </h1>
            <p className="text-2xl text-white/90 mb-6 animate-fade-in-up delay-300">Building Foundations</p>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-400">
              The perfect starting point for athletes to discover the joy of cheerleading in a supportive, 
              fun environment focused on learning fundamentals and building confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Program Overview */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h2 className="text-4xl font-bold mb-6 animate-fade-in-up">
                <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Program Overview
                </span>
              </h2>
              <div className="space-y-6 text-gray-700 leading-relaxed animate-fade-in-up delay-200">
                <p className="text-lg">
                  Our Non-Competitive/Performance Teams program is designed for athletes ages 4-16 who are new to cheerleading or prefer 
                  a non-competitive environment. This program focuses on creating a positive experience with the sport 
                  while building essential motor skills, coordination, and social development.
                </p>
                <p>
                  In a nurturing, pressure-free environment, athletes learn the basic building blocks of cheerleading including 
                  simple tumbling movements, fundamental stunts, basic dance steps, and age-appropriate choreography. Our experienced 
                  coaches emphasize fun, safety, and personal growth over competition.
                </p>
                <p>
                  The program culminates in fun showcase performances for families, giving athletes the opportunity to demonstrate 
                  their new skills and build confidence in front of a supportive audience. All events are held within 10 miles of our practice facility, 
                  requiring no travel for families. This positive experience often serves 
                  as a stepping stone for athletes who wish to continue their cheerleading journey in our competitive programs.
                </p>
              </div>
            </div>

            {/* Quick Info Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-blue-50 to-gray-50 p-6 rounded-2xl shadow-lg animate-fade-in-up delay-300">
                <h3 className="text-xl font-bold mb-6" style={{ color: '#0000FE' }}>Program Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">Age Range</div>
                      <div className="text-gray-600">4-16 years old</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ background: 'linear-gradient(135deg, #4169E1, #0000FE)' }}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">Schedule</div>
                      <div className="text-gray-600">Once per week</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ background: 'linear-gradient(135deg, #000000, #333333)' }}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">Session Length</div>
                      <div className="text-gray-600">45-60 minutes</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ background: 'linear-gradient(135deg, #4169E1, #000000)' }}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">Class Size</div>
                      <div className="text-gray-600">8-12 athletes</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Notification */}
      <section className="py-12 px-4 bg-yellow-50 border-b border-yellow-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start space-x-4 animate-fade-in-up">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0000FE' }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m-3-6h6" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Pricing Information</h3>
              <p className="text-gray-700">
                <strong>Pricing: TBA (To Be Announced)</strong><br />
                We are currently developing our pricing models for the upcoming season and working to make this information available as soon as possible. 
                Please contact us for the most current pricing details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 animate-fade-in-up">
            <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              What Your Athlete Will Learn
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 text-center animate-fade-in-up delay-100">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Basic Tumbling</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Forward rolls</li>
                <li>Cartwheels</li>
                <li>Handstands</li>
                <li>Bridge kicks</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 text-center animate-fade-in-up delay-200">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4169E1, #0000FE)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Fundamental Stunts</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Partner stunts</li>
                <li>Basic lifts</li>
                <li>Balance positions</li>
                <li>Safe dismounts</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 text-center animate-fade-in-up delay-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #000000, #333333)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Dance & Movement</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Basic dance steps</li>
                <li>Rhythm & timing</li>
                <li>Simple choreography</li>
                <li>Performance skills</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 text-center animate-fade-in-up delay-400">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4169E1, #000000)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Team Building</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Cooperation skills</li>
                <li>Following directions</li>
                <li>Making friends</li>
                <li>Confidence building</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 animate-fade-in-up">
            <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Program Benefits
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Physical Development</h3>
                    <p className="text-gray-600">Improves coordination, balance, flexibility, and overall fitness in a fun, age-appropriate way.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1" style={{ background: 'linear-gradient(135deg, #4169E1, #0000FE)' }}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Social Skills</h3>
                    <p className="text-gray-600">Develops teamwork, communication, and friendship-building skills in a supportive group setting.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1" style={{ background: 'linear-gradient(135deg, #000000, #333333)' }}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Confidence Building</h3>
                    <p className="text-gray-600">Builds self-esteem through positive reinforcement and achievement of personal goals.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1" style={{ background: 'linear-gradient(135deg, #4169E1, #000000)' }}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Foundation for Future</h3>
                    <p className="text-gray-600">Provides a solid foundation for athletes who may want to continue in competitive cheerleading.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="animate-fade-in-up delay-200">
              <div className="bg-gradient-to-br from-blue-100 to-gray-100 p-8 rounded-2xl">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Fun-First Approach</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our program prioritizes enjoyment and positive experiences, ensuring that every athlete 
                    develops a love for the sport while learning valuable life skills.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1, #000000)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6 animate-fade-in-up">
            Ready to Start Your Athlete&apos;s Cheerleading Journey?
          </h2>
          <p className="text-xl text-gray-200 mb-8 leading-relaxed animate-fade-in-up delay-200">
            Want to prepare for your next season? Contact us for information on tryouts and/or classes to get ready for our next season.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
            <button className="bg-white text-black px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
              Tryout Information
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-black transition-all duration-300">
              Tumbling Classes
            </button>
          </div>
          
          <div className="mt-12 animate-fade-in-up delay-400">
            <Link href="/programs" className="inline-flex items-center text-white/80 hover:text-white transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to All Programs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 