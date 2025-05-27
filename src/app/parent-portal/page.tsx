export default function ParentPortal() {
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
              Parent
            </span>
            <span className="text-white"> Portal</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-300">
            Access your athlete's information, schedules, payments, and more through our secure parent portal powered by iClassPro.
          </p>
        </div>
      </section>

      {/* Portal Access Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 animate-fade-in-up">
            <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Access Your Portal
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 mb-12 leading-relaxed animate-fade-in-up delay-200">
            Log in to your iClassPro parent portal to manage your athlete's account, view schedules, make payments, and stay connected with Spirit Athletics.
          </p>

          <div className="animate-fade-in-up delay-300">
            <a 
              href="https://portal.iclasspro.com/spiritathletics7750/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-12 py-6 text-xl font-semibold text-white rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Access Parent Portal
              <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 animate-fade-in-up">
            <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Portal Features
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Account Management */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100 text-center animate-fade-in-up">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Account Management</h3>
              <p className="text-gray-600">Update contact information, emergency contacts, and athlete details all in one secure location.</p>
            </div>

            {/* Payments & Billing */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100 text-center animate-fade-in-up delay-100">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Payments & Billing</h3>
              <p className="text-gray-600">Make secure online payments, view billing history, and set up automatic payment plans for convenience.</p>
            </div>

            {/* Documents & Forms */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-100 text-center animate-fade-in-up delay-200">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Documents & Forms</h3>
              <p className="text-gray-600">Access important documents, complete required forms, and download certificates and awards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 animate-fade-in-up">
            <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Need Help?
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* First Time Users */}
            <div className="bg-gradient-to-br from-blue-50 to-gray-50 p-8 rounded-2xl shadow-lg animate-fade-in-up">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">First Time Users</h3>
              <p className="text-gray-600 mb-6">
                New to the parent portal? You should have received login credentials via email when you enrolled. If you need assistance accessing your account, please contact us.
              </p>
              <a 
                href="mailto:hdcspirit@aol.com?subject=Parent Portal Access Help"
                className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-full transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}
              >
                Get Help
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Technical Support */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 rounded-2xl shadow-lg animate-fade-in-up delay-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Technical Support</h3>
              <p className="text-gray-600 mb-6">
                Having trouble with the portal? Our team is here to help you navigate the system and resolve any technical issues you may encounter.
              </p>
              <a 
                href="tel:+17609477130"
                className="inline-flex items-center px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300"
              >
                Call Support
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access CTA */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1, #000000)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6 animate-fade-in-up">
            Ready to Access Your Portal?
          </h2>
          <p className="text-xl text-gray-200 mb-8 leading-relaxed animate-fade-in-up delay-200">
            Stay connected with your athlete's cheerleading journey. Access schedules, make payments, and communicate with coaches all in one place.
          </p>
          <div className="animate-fade-in-up delay-300">
            <a 
              href="https://portal.iclasspro.com/spiritathletics7750/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-white text-black px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Login to Parent Portal
              <svg className="w-4 h-4 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
} 