import Link from 'next/link';

export default function EliteAllStarProgram() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(51,51,51,0.8))' }}></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-6 h-6 rounded-full animate-float" style={{ backgroundColor: '#333333' }}></div>
        <div className="absolute top-40 right-20 w-4 h-4 bg-white rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-5 h-5 bg-gray-300 rounded-full animate-float-slow"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-8 animate-fade-in-up">
            <div className="flex items-center space-x-2 text-white/80">
              <Link href="/programs" className="hover:text-white transition-colors">Programs</Link>
              <span>/</span>
              <span className="text-white">Elite All-Star</span>
            </div>
          </nav>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm mb-6 animate-fade-in-up">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-in-up delay-200">
              <span className="text-white">Elite All-Star</span>
            </h1>
            <p className="text-2xl text-white/90 mb-6 animate-fade-in-up delay-300">Championship Level</p>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-400">
              Our premier competitive program for advanced athletes seeking to compete at the highest levels including nationals.
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
                  Our Elite All-Star program represents the pinnacle of competitive cheerleading at Spirit Athletics. 
                  Designed for athletes ages 5-18 who are committed to excellence, this program prepares athletes 
                  for the highest levels of competition including regional, state, and national championships.
                </p>
                <p>
                  Athletes in this program master elite-level tumbling, advanced stunting sequences, and complex 
                  choreography while developing the mental toughness and teamwork required for championship-level 
                  competition. This program demands dedication, skill, and a commitment to excellence.
                </p>
                <p>
                  <em>Detailed program information and curriculum will be added here.</em>
                </p>
              </div>
            </div>

            {/* Quick Info Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-blue-50 to-gray-50 p-6 rounded-2xl shadow-lg animate-fade-in-up delay-300">
                <h3 className="text-xl font-bold mb-6" style={{ color: '#0000FE' }}>Program Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ background: 'linear-gradient(135deg, #000000, #333333)' }}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">Age Range</div>
                      <div className="text-gray-600">5-18 years old</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">Schedule</div>
                      <div className="text-gray-600">2-3x per week</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ background: 'linear-gradient(135deg, #4169E1, #000000)' }}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">Competition Level</div>
                      <div className="text-gray-600">National</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Placeholder Content */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 animate-fade-in-up">
            <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Program Details Coming Soon
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed animate-fade-in-up delay-200">
            Detailed curriculum, benefits, and program-specific information will be added here.
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #000000, #333333, #4169E1)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6 animate-fade-in-up">
            Ready to Compete at the Elite Level?
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