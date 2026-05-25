export default function Forms() {
  const formCategories = [
    {
      title: "Required Forms",
      description: "Essential forms that must be completed for all athletes",
      forms: [
        {
          name: "Liability Waiver",
          description: "Required waiver for all participants - must be completed before participation. Sign online instantly!",
          filename: "SPIRIT ATHLETICS WAIVER-RELEASE.pdf",
          required: true,
          signOnlineUrl: "/waiver"
        },
        {
          name: "Full Registration Form",
          description: "Complete athlete registration including all necessary information and program selection",
          filename: "full-registration-form.pdf",
          required: true
        }
      ]
    },
    {
      title: "Program Information",
      description: "Essential information for the 2026-27 season",
      forms: [
        {
          name: "Program Information Document",
          description: "Comprehensive guide covering rules, conduct, programs, teams, and all high-level information for the 2026-27 season",
          filename: "Cheer Program Information_26-27.pdf",
          required: false
        }
      ]
    }
  ];

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
              Forms &
            </span>
            <span className="text-white"> Documents</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-300">
            Download important forms and documents for enrollment, competitions, and administrative purposes.
          </p>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-12 px-4 bg-yellow-50 border-b border-yellow-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start space-x-4 animate-fade-in-up">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#0000FE' }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Important Notice</h3>
              <p className="text-gray-700">
                All required forms must be completed and submitted before your athlete can participate in practices or competitions. 
                Please ensure all information is accurate and up-to-date. The Program Information Document contains essential details for the upcoming 2026-27 season.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Submission Info */}
      <section className="py-8 px-4 bg-blue-50 border-b border-blue-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start space-x-4 animate-fade-in-up">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-green-600">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">How to Submit the Liability Waiver</h3>
              <p className="text-gray-700">
                All liability waivers must be <a href="/waiver" className="text-blue-600 hover:underline font-semibold">signed online through our website</a>. The process is quick, secure, and legally binding. Your signed waiver will be stored digitally on file.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Forms Categories */}
      {formCategories.map((category, categoryIndex) => (
        <section key={categoryIndex} className={`py-20 px-4 ${categoryIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 animate-fade-in-up">
                <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {category.title}
                </span>
              </h2>
              <p className="text-xl text-gray-600 animate-fade-in-up delay-200">
                {category.description}
              </p>
            </div>

            <div className={`grid gap-8 ${category.forms.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : category.forms.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {category.forms.map((form, formIndex) => (
                <div key={formIndex} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-fade-in-up" style={{ animationDelay: `${(formIndex + 1) * 100}ms` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    {form.required && (
                      <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                        Required
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{form.name}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{form.description}</p>
                  
                  {(form as any).signOnlineUrl ? (
                    <a 
                      href={(form as any).signOnlineUrl}
                      className="w-full inline-flex items-center justify-center px-4 py-3 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Sign Online Now
                    </a>
                  ) : (
                    <a 
                      href={`/documents/${form.filename}`}
                      className="w-full inline-flex items-center justify-center px-4 py-3 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Submission Instructions */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 animate-fade-in-up">
            <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              How to Sign Your Waiver
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center animate-fade-in-up">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                1
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Read the Waiver</h3>
              <p className="text-gray-600">Click &ldquo;Sign Online Now&rdquo; on the Liability Waiver and carefully read through the agreement.</p>
            </div>

            {/* Step 2 */}
            <div className="text-center animate-fade-in-up delay-200">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                2
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Fill In & Sign</h3>
              <p className="text-gray-600">Enter the athlete&apos;s name, parent/guardian information, and draw your signature digitally.</p>
            </div>

            {/* Step 3 */}
            <div className="text-center animate-fade-in-up delay-300">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                3
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Done!</h3>
              <p className="text-gray-600">Submit the form and your signed waiver is instantly stored on file. No printing, scanning, or emailing needed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact for Help */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1, #000000)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6 animate-fade-in-up">
            Need Help with Forms?
          </h2>
          <p className="text-xl text-gray-200 mb-8 leading-relaxed animate-fade-in-up delay-200">
            If you have questions about any forms or need assistance completing them, don&apos;t hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
            <a 
              href="mailto:frontdesk@spiritathletics.net?subject=Forms Help Request"
              className="bg-white text-black px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Email for Help
            </a>
            <a 
              href="tel:+17609477130"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-black transition-all duration-300"
            >
              Call Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
} 