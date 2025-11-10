import Image from 'next/image';
import Link from 'next/link';
import ShowcasePopup from '@/components/ShowcasePopup';

export default function Home() {
  return (
    <div className="min-h-screen">
      <ShowcasePopup />

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
            We provide competitive cheerleading programs 
            for athletes of all levels, from non-competitive to Elite All-Star teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-500">
            <Link href="/programs" className="text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg animate-pulse-slow inline-block text-center" style={{ background: 'linear-gradient(135deg, #0000FE, #0000CC)' }}>
              View Programs
            </Link>
            <Link href="/contact" className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white transition-all duration-300 backdrop-blur-sm inline-block text-center hover:text-blue-600">
              Contact Us
            </Link>
          </div>
        </div>

        {/* Floating Elements with enhanced animations */}
        <div className="absolute top-20 left-10 w-4 h-4 rounded-full animate-float" style={{ backgroundColor: '#0000FE' }}></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-white rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-20 left-20 w-3 h-3 bg-gray-400 rounded-full animate-float-slow"></div>
      </section>

      {/* Showcase Alert Banner */}
      <section className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 py-8 px-4 border-y-4 border-yellow-500 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-900 text-yellow-400 rounded-full p-4 animate-pulse-slow">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold inline-block mb-1 animate-pulse">
                  THIS WEEK! 🔥
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Fall Showcase 2025 - Don't Miss Out!
                </h3>
                <p className="text-gray-800 font-semibold">
                  📍 Granite Hills High School • 🕐 Event Starts 1:00 PM
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/showcase"
                className="bg-gradient-to-r from-blue-900 to-blue-700 text-white px-6 py-4 rounded-xl font-bold hover:from-blue-800 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-xl text-center whitespace-nowrap"
              >
                📋 Event Details
              </Link>
              <a 
                href="https://buytickets.at/spiritathletics/1936402"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-xl font-bold hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-xl text-center whitespace-nowrap"
              >
                🎫 Get Tickets
              </a>
            </div>
          </div>
        </div>
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
            <Link href="/programs" className="text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg inline-block text-center" style={{ background: 'linear-gradient(135deg, #0000FE, #0000CC)' }}>
              Explore Programs
            </Link>
            <Link href="/contact" className="border-2 text-black px-8 py-4 rounded-full font-semibold transition-all duration-300 inline-block text-center hover:bg-blue-600 hover:text-white" style={{ borderColor: '#0000FE' }}>
              Schedule a Visit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 