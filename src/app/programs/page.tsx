import Link from 'next/link';

export default function Programs() {
  const programs = [
    {
      id: 'non-competitive',
      title: 'Non-Competitive',
      subtitle: 'Building Foundations',
      description: 'Perfect for beginners and young athletes looking to learn the fundamentals of cheerleading in a supportive, non-competitive environment.',
      features: ['Basic tumbling skills', 'Fundamental stunts', 'Dance and choreography', 'Team building'],
      ageRange: 'Ages 4-16',
      commitment: 'Once per week',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #0000FE, #4169E1)',
    },
    {
      id: 'novice',
      title: 'Novice',
      subtitle: 'First Steps to Competition',
      description: 'An introduction to competitive cheerleading with basic skills development and local competition opportunities.',
      features: ['Competition preparation', 'Skill progression', 'Team routines', 'Local competitions'],
      ageRange: 'Ages 4-14',
      commitment: 'Once per week',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #4169E1, #0000FE)',
    },
    {
      id: 'prep',
      title: 'Prep',
      subtitle: 'Competitive Excellence',
      description: 'Intermediate level competitive program focusing on skill advancement and regional competition participation.',
      features: ['Advanced tumbling', 'Complex stunting', 'Regional competitions', 'Performance excellence'],
      ageRange: 'Ages 5-18',
      commitment: '1-2x per week',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #4169E1, #000000)',
    },
    {
      id: 'elite-all-star',
      title: 'Elite All-Star',
      subtitle: 'Championship Level',
      description: 'Our premier competitive program for advanced athletes seeking to compete at the highest levels including nationals.',
      features: ['Elite-level skills', 'National competitions', 'Advanced choreography', 'Championship training'],
      ageRange: 'Ages 5-18',
      commitment: '2-3x per week',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #000000, #333333)',
    },
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
              Our
            </span>
            <span className="text-white"> Programs</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-300">
            From first-time cheerleaders to elite competitors, we have a program designed to help every athlete reach their full potential.
          </p>
        </div>
      </section>

      {/* Programs Overview */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-6">
              <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Find Your Perfect Program
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Each program is carefully designed to provide age-appropriate training, skill development, 
              and competitive opportunities that match your athlete&apos;s goals and experience level.
            </p>
          </div>

          {/* Program Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {programs.map((program, index) => (
              <Link 
                key={program.id} 
                href={`/programs/${program.id}`}
                className="group block"
              >
                <div className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100 overflow-hidden animate-fade-in-up`} style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                  {/* Card Header */}
                  <div className="p-6" style={{ background: program.gradient }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        {program.icon}
                      </div>
                      <div className="text-right">
                        <div className="text-white/80 text-sm font-medium">{program.ageRange}</div>
                        <div className="text-white/60 text-xs">{program.commitment}</div>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{program.title}</h3>
                    <p className="text-white/90 font-medium">{program.subtitle}</p>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {program.description}
                    </p>

                    {/* Features List */}
                    <div className="space-y-3 mb-6">
                      <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Program Highlights</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {program.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: '#0000FE' }}></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Call to Action */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: '#0000FE' }}>
                        Learn More
                      </span>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: program.gradient }}>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Program Comparison */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-6">
              <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Program Comparison
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Compare our programs to find the perfect fit for your athlete&apos;s skill level and goals.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in-up delay-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                    <th className="px-6 py-4 text-left text-white font-semibold">Program</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">Age Range</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">Practice Schedule</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">Competition Level</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">Focus Areas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">Non-Competitive</div>
                      <div className="text-sm text-gray-600">Building Foundations</div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">4-16 years</td>
                    <td className="px-6 py-4 text-center text-gray-600">Once per week</td>
                    <td className="px-6 py-4 text-center text-gray-600">None</td>
                    <td className="px-6 py-4 text-center text-gray-600">Fun & Fundamentals</td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">Novice</div>
                      <div className="text-sm text-gray-600">First Steps to Competition</div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">4-14 years</td>
                    <td className="px-6 py-4 text-center text-gray-600">Once per week</td>
                    <td className="px-6 py-4 text-center text-gray-600">Local</td>
                    <td className="px-6 py-4 text-center text-gray-600">Skill Building</td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">Prep</div>
                      <div className="text-sm text-gray-600">Competitive Excellence</div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">5-18 years</td>
                    <td className="px-6 py-4 text-center text-gray-600">1-2x per week</td>
                    <td className="px-6 py-4 text-center text-gray-600">Regional</td>
                    <td className="px-6 py-4 text-center text-gray-600">Advanced Skills</td>
                  </tr>
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">Elite All-Star</div>
                      <div className="text-sm text-gray-600">Championship Level</div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">5-18 years</td>
                    <td className="px-6 py-4 text-center text-gray-600">2-3x per week</td>
                    <td className="px-6 py-4 text-center text-gray-600">National</td>
                    <td className="px-6 py-4 text-center text-gray-600">Elite Performance</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 animate-fade-in-up">
            <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Ready to Get Started?
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed animate-fade-in-up delay-200">
            Want to prepare for your next season? Contact us for information on tryouts and/or classes to get ready for our next season.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in-up delay-300">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Annual Tryouts</h3>
              <p className="text-gray-600 text-sm">Tryouts held the first week of June each year for the upcoming season.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4169E1, #0000FE)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Tumbling Classes</h3>
              <p className="text-gray-600 text-sm">Year-round tumbling classes available to help prepare for the next season.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #000000, #333333)' }}>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Season Information</h3>
              <p className="text-gray-600 text-sm">New athletes rarely accepted after August. Plan ahead for the best opportunities.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-400">
            <button className="text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg" style={{ background: 'linear-gradient(135deg, #0000FE, #0000CC)' }}>
              Tryout Information
            </button>
            <button className="border-2 text-black px-8 py-4 rounded-full font-semibold transition-all duration-300" style={{ borderColor: '#0000FE' }}>
              Tumbling Classes
            </button>
          </div>
        </div>
      </section>
    </div>
  );
} 