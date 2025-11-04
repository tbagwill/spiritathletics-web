export default function Calendar() {
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
              Calendar
            </span>
            <span className="text-white"> & Events</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-300">
            Stay up-to-date with practices, competitions, and special events for all Spirit Athletics programs.
          </p>
        </div>
      </section>

      {/* Calendar Legend */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 animate-fade-in-up">
            <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Event Types
            </span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up delay-200">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: '#0000FE' }}></div>
              <span className="font-medium text-gray-800">Practices</span>
            </div>
            
            <div className="flex items-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-3"></div>
              <span className="font-medium text-gray-800">Competitions</span>
            </div>
            
            <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-3"></div>
              <span className="font-medium text-gray-800">Special Events</span>
            </div>
            
            <div className="flex items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="w-4 h-4 rounded-full bg-purple-500 mr-3"></div>
              <span className="font-medium text-gray-800">Important Dates</span>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar Embed Section */}
      <section className="py-8 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-gray-50 p-8 rounded-2xl shadow-lg animate-fade-in-up delay-300">
            {/* Google Calendar Embed - All Calendars Combined */}
            <div className="bg-white rounded-lg overflow-hidden shadow-lg" style={{ height: '600px' }}>
              <iframe 
                src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=America%2FLos_Angeles&bgcolor=%23ffffff&mode=MONTH&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=1&showTz=0&src=12e16a482f7905033cfc8863c82d9629c0a3de8dd98f782f7ab17b0bfc3ea21e%40group.calendar.google.com&color=%230B8043&src=4ee448b4a97db488525abe69399f46f74f7109e698765640b3bf62519d73d531%40group.calendar.google.com&color=%23D50000&src=d08f7bd81e0ced240a45d09e6cc9fc1eabd790b6973ba2a6d9a265ef1430a8f3%40group.calendar.google.com&color=%237CB342&src=685b6a5e78d6ec7d294e441ef00b6357dd7f08b4642e4375ae2386435bf41582%40group.calendar.google.com&color=%238E24AA"
                style={{ border: 0 }}
                width="100%" 
                height="600" 
                frameBorder="0" 
                scrolling="no"
                className="w-full h-full"
                title="Spirit Athletics Calendar"
              ></iframe>
            </div>
            
            {/* Calendar Features */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="font-medium text-gray-800">Toggle calendar types on/off</span>
              </div>
              
              <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="font-medium text-gray-800">Mobile-friendly view</span>
              </div>
              
              <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium text-gray-800">Add to your personal calendar</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 px-4" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 animate-fade-in-up">
            <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Important Dates
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 animate-fade-in-up delay-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Annual Tryouts</h3>
                  <p className="text-gray-600">First week of June</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Tryouts for all competitive programs. Registration typically opens in May.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 animate-fade-in-up delay-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ background: 'linear-gradient(135deg, #4169E1, #0000FE)' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Season Start</h3>
                  <p className="text-gray-600">Late August</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Regular season practices begin. New athletes rarely accepted after this point.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 animate-fade-in-up delay-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ background: 'linear-gradient(135deg, #000000, #333333)' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Competition Season</h3>
                  <p className="text-gray-600">October - March</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Peak competition season with local, regional, and national events.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 animate-fade-in-up delay-400">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ background: 'linear-gradient(135deg, #4169E1, #000000)' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Tumbling Classes</h3>
                  <p className="text-gray-600">Year-round</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Ongoing tumbling classes available to help athletes prepare for tryouts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1, #000000)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6 animate-fade-in-up">
            Stay Connected
          </h2>
          <p className="text-xl text-gray-200 mb-8 leading-relaxed animate-fade-in-up delay-200">
            Never miss an important date! Subscribe to our calendar or contact us for more information.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
            <button className="bg-white text-black px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
              Subscribe to Calendar
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-black transition-all duration-300">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
} 