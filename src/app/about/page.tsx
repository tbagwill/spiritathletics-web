import Image from 'next/image';

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,254,0.9), rgba(0,0,0,0.7), rgba(65,105,225,0.8))' }}></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-6 h-6 rounded-full animate-float" style={{ backgroundColor: '#0000FE' }}></div>
        <div className="absolute top-40 right-20 w-4 h-4 bg-white rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/4 w-5 h-5 bg-gray-300 rounded-full animate-float-slow"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            <span style={{ background: 'linear-gradient(45deg, #FFFFFF, #4169E1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              About
            </span>
            <span className="text-white"> Spirit Athletics</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-300">
            Building champions through dedication, teamwork, and the pursuit of excellence in competitive cheerleading.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h2 className="text-4xl font-bold mb-6">
                <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Our Story
                </span>
              </h2>
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p className="text-lg">
                  Spirit Athletics represents the evolution of a dream that began as High Desert Cheer. 
                  Our journey has been one of growth, transformation, and an unwavering commitment to 
                  developing young athletes into confident, skilled cheerleaders.
                </p>
                <p>
                  What started as a local cheerleading program has grown into a comprehensive athletic 
                  organization that serves athletes at every level. From our non-competitive programs 
                  that focus on building foundational skills and confidence, to our Elite All-Star 
                  teams that compete at the highest levels, we've maintained our core mission: 
                  to provide every athlete with the opportunity to reach their full potential.
                </p>
                <p>
                  The transition to Spirit Athletics marks not just a name change, but a renewed 
                  commitment to excellence, innovation, and the values that make our program special. 
                  We honor our past while embracing the future of competitive cheerleading.
                </p>
              </div>
            </div>
            
            <div className="relative animate-fade-in-up delay-200">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-w-4 aspect-h-3 bg-gradient-to-br from-blue-100 to-gray-100 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium">Team Photo Coming Soon</p>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-20" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 animate-fade-in-up">
            <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Our Mission & Values
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Mission */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100 animate-fade-in-up delay-100">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To provide a safe, supportive, and challenging environment where athletes can develop 
                their cheerleading skills, build lasting friendships, and grow into confident, 
                responsible young people who embody the spirit of teamwork and excellence.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100 animate-fade-in-up delay-200">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #000000, #333333)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To be the premier cheerleading organization in our region, known for developing 
                exceptional athletes who compete with integrity, support each other unconditionally, 
                and represent our program with pride both on and off the mat.
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100 animate-fade-in-up delay-300">
            <h3 className="text-2xl font-bold text-center mb-8" style={{ color: '#0000FE' }}>Our Core Values</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center group">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Respect</h4>
                <p className="text-sm text-gray-600">For teammates, coaches, competitors, and ourselves</p>
              </div>
              
              <div className="text-center group">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #4169E1, #0000FE)' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Teamwork</h4>
                <p className="text-sm text-gray-600">Supporting each other to achieve common goals</p>
              </div>
              
              <div className="text-center group">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #000000, #333333)' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Excellence</h4>
                <p className="text-sm text-gray-600">Striving for our personal best in everything we do</p>
              </div>
              
              <div className="text-center group">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #4169E1, #000000)' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Integrity</h4>
                <p className="text-sm text-gray-600">Doing the right thing, even when no one is watching</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 animate-fade-in-up">
            <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              What Sets Us Apart
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group animate-fade-in-up delay-100">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 group-hover:rotate-6" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Comprehensive Programs</h3>
              <p className="text-gray-600 leading-relaxed">
                From recreational to elite competitive levels, we offer pathways for every athlete to grow and succeed.
              </p>
            </div>

            <div className="text-center group animate-fade-in-up delay-200">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 group-hover:rotate-6" style={{ background: 'linear-gradient(135deg, #000000, #333333)' }}>
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Modern Facilities</h3>
              <p className="text-gray-600 leading-relaxed">
                State-of-the-art training facilities equipped with everything needed for safe, effective practice.
              </p>
            </div>

            <div className="text-center group animate-fade-in-up delay-300">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 group-hover:rotate-6" style={{ background: 'linear-gradient(135deg, #4169E1, #0000FE)' }}>
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Family Atmosphere</h3>
              <p className="text-gray-600 leading-relaxed">
                A supportive community where athletes, families, and coaches work together toward shared goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Showcase */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-6 animate-fade-in-up">
            <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Our Achievements
            </span>
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto animate-fade-in-up delay-200">
            A legacy of excellence built through dedication, hard work, and the pursuit of greatness.
          </p>

          {/* Achievement Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center group animate-fade-in-up delay-100">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">15+</div>
              <div className="text-sm text-gray-600 font-medium">Regional Championships</div>
            </div>

            <div className="text-center group animate-fade-in-up delay-200">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300" style={{ background: 'linear-gradient(135deg, #4169E1, #0000FE)' }}>
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">8</div>
              <div className="text-sm text-gray-600 font-medium">National Qualifications</div>
            </div>

            <div className="text-center group animate-fade-in-up delay-300">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300" style={{ background: 'linear-gradient(135deg, #000000, #333333)' }}>
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">3</div>
              <div className="text-sm text-gray-600 font-medium">State Championships</div>
            </div>

            <div className="text-center group animate-fade-in-up delay-400">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300" style={{ background: 'linear-gradient(135deg, #4169E1, #000000)' }}>
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">200+</div>
              <div className="text-sm text-gray-600 font-medium">Athletes Trained</div>
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 animate-fade-in-up delay-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">2024 Regional Champions</h3>
                  <p className="text-sm text-gray-600">Elite All-Star Division</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Our Elite team dominated the regional competition, earning a perfect score and advancing to nationals.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 animate-fade-in-up delay-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ background: 'linear-gradient(135deg, #4169E1, #0000FE)' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">National Bid Winner</h3>
                  <p className="text-sm text-gray-600">2023 Season</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Earned an at-large bid to compete at the prestigious national championships in Orlando, Florida.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 animate-fade-in-up delay-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ background: 'linear-gradient(135deg, #000000, #333333)' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">State Championship</h3>
                  <p className="text-sm text-gray-600">Prep Level Division</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Our Prep team captured the state title with an outstanding performance showcasing technical excellence.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 animate-fade-in-up delay-400">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ background: 'linear-gradient(135deg, #4169E1, #000000)' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Sportsmanship Award</h3>
                  <p className="text-sm text-gray-600">2023 Regional Competition</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Recognized for outstanding sportsmanship and team spirit throughout the competitive season.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 animate-fade-in-up delay-500">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ background: 'linear-gradient(135deg, #0000FE, #000000)' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Perfect Score</h3>
                  <p className="text-sm text-gray-600">Novice Division</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Our Novice team achieved a perfect score at their first competition, demonstrating exceptional skill development.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 animate-fade-in-up delay-600">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ background: 'linear-gradient(135deg, #000000, #4169E1)' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Coach of the Year</h3>
                  <p className="text-sm text-gray-600">Regional Recognition</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Our head coach was honored with the Coach of the Year award for outstanding leadership and athlete development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1, #000000)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6 animate-fade-in-up">
            Ready to Join the Spirit Athletics Family?
          </h2>
          <p className="text-xl text-gray-200 mb-8 leading-relaxed animate-fade-in-up delay-200">
            Discover how we can help your athlete reach their full potential in a supportive, challenging environment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
            <button className="bg-white text-black px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg" style={{ '--hover-bg': '#f8fafc' } as React.CSSProperties}>
              View Our Programs
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-black transition-all duration-300">
              Schedule a Tour
            </button>
          </div>
        </div>
      </section>
    </div>
  );
} 