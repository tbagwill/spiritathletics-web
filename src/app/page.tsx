import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Announcement Banner - Now at the top for immediate visibility */}
      <section className="relative overflow-hidden py-4" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1, #000000)' }}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full animate-bounce"></div>
          <div className="absolute top-8 right-8 w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-4 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-ping"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 animate-fade-in">
            <div className="flex items-center justify-center text-center">
              <span className="text-3xl mr-3 animate-bounce">📢</span>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white mb-1">
                  Important Announcements
                </h2>
                <p className="text-white/90 text-sm md:text-base">
                  Stay tuned for important updates about schedules, events, and team information!
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Animated border */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
      </section>

      {/* Hero Section with Background Image */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/SpiritAthletics_Logo_Header_Full  Render.JPG"
            alt="Spirit Athletics Header"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,254,0.8), rgba(0,0,0,0.6), rgba(65,105,225,0.8))' }}></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="animate-gradient" style={{ background: 'linear-gradient(45deg, #0000FE, #4169E1, #FFFFFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', backgroundSize: '200% 200%' }}>
              Welcome to
            </span>
            <br />
            <span className="text-white drop-shadow-lg">Spirit Athletics</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-300">
            Formerly High Desert Cheer, we provide competitive cheerleading programs 
            for athletes of all levels, from non-competitive to Elite All-Star teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-500">
            <button className="text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg animate-pulse-slow" style={{ background: 'linear-gradient(135deg, #0000FE, #0000CC)' }}>
              View Programs
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white transition-all duration-300 backdrop-blur-sm" style={{ '--hover-text-color': '#0000FE' } as React.CSSProperties}>
              Contact Us
            </button>
          </div>
        </div>

        {/* Floating Elements with enhanced animations */}
        <div className="absolute top-20 left-10 w-4 h-4 rounded-full animate-float" style={{ backgroundColor: '#0000FE' }}></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-white rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-20 left-20 w-3 h-3 bg-gray-400 rounded-full animate-float-slow"></div>
      </section>

      {/* Quick Info Cards */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0, #f1f5f9)' }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 animate-fade-in-up">
            <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Why Choose Spirit Athletics?
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100 animate-fade-in-up delay-100">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:rotate-6" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Programs for All Levels</h3>
              <p className="text-gray-600 leading-relaxed">
                From non-competitive beginners to Elite All-Star teams, we have a program for every athlete to grow and excel.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100 animate-fade-in-up delay-200">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:rotate-6" style={{ background: 'linear-gradient(135deg, #000000, #333333)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Parent Portal</h3>
              <p className="text-gray-600 leading-relaxed">
                Access schedules, payments, and important updates through our convenient iClassPro parent portal system.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100 animate-fade-in-up delay-300">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:rotate-6" style={{ background: 'linear-gradient(135deg, #4169E1, #0000FE)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Experienced Staff</h3>
              <p className="text-gray-600 leading-relaxed">
                Our dedicated coaches bring years of experience and passion to every practice and competition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          <h2 className="text-4xl font-bold mb-6">
            <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Ready to Join Our Team?
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Discover the perfect program for your athlete and become part of the Spirit Athletics family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg" style={{ background: 'linear-gradient(135deg, #0000FE, #0000CC)' }}>
              Explore Programs
            </button>
            <button className="border-2 text-black px-8 py-4 rounded-full font-semibold transition-all duration-300" style={{ borderColor: '#0000FE', '--hover-bg': '#0000FE' } as React.CSSProperties}>
              Schedule a Visit
            </button>
          </div>
        </div>
      </section>
    </div>
  );
} 