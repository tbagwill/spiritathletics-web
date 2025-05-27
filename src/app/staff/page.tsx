export default function Staff() {
  const staffMembers = [
    {
      name: 'Patricia "Patti" Perniciaro',
      title: 'Head Coach, Owner',
      description: 'Patti brings years of experience and passion to Spirit Athletics. As the founder and head coach, she leads our program with dedication to excellence and athlete development.',
      image: '/images/staff/patti-placeholder.jpg'
    },
    {
      name: 'Julie Bagwill',
      title: 'Co Owner',
      description: 'Julie co-founded Spirit Athletics with a vision of creating a supportive environment where athletes can thrive. Her business expertise helps drive our program forward.',
      image: '/images/staff/julie-placeholder.jpg'
    },
    {
      name: 'John Migaiolo',
      title: 'Program Director',
      description: 'John oversees all program operations, ensuring each athlete receives the best training experience. His organizational skills keep our programs running smoothly.',
      image: '/images/staff/john-placeholder.jpg'
    },
    {
      name: 'Candice Vargas',
      title: 'Senior Coach, Social Media',
      description: 'Candice combines her coaching expertise with social media management, helping showcase our athletes\' achievements and keeping our community connected.',
      image: '/images/staff/candice-placeholder.jpg'
    },
    {
      name: 'Tyler Bagwill',
      title: 'Senior Coach, Digital Media',
      description: 'Tyler brings technical expertise to our coaching staff while managing our digital presence. His innovative approach helps modernize our training methods.',
      image: '/images/staff/tyler-placeholder.jpg'
    },
    {
      name: 'Angel Martinez',
      title: 'Senior Coach',
      description: 'Angel is dedicated to helping athletes reach their full potential through skilled coaching and mentorship. Her positive energy motivates athletes to excel.',
      image: '/images/staff/angel-placeholder.jpg'
    },
    {
      name: 'Rhyan Chollier',
      title: 'Senior Coach',
      description: 'Rhyan brings enthusiasm and expertise to every practice. Her commitment to athlete development makes her an invaluable part of our coaching team.',
      image: '/images/staff/rhyan-placeholder.jpg'
    },
    {
      name: 'Bethany Snow',
      title: 'Senior Coach',
      description: 'Bethany\'s coaching philosophy focuses on building confidence and skills. She creates a supportive environment where athletes can grow and succeed.',
      image: '/images/staff/bethany-placeholder.jpg'
    },
    {
      name: 'Jessica Thomas',
      title: 'Senior Coach',
      description: 'Jessica combines technical knowledge with a passion for cheerleading. Her dedication to excellence helps athletes achieve their competitive goals.',
      image: '/images/staff/jessica-placeholder.jpg'
    },
    {
      name: 'Natalie Falzone',
      title: 'Senior Coach',
      description: 'Natalie brings energy and expertise to our coaching staff. Her commitment to athlete development helps create champions both on and off the mat.',
      image: '/images/staff/natalie-placeholder.jpg'
    },
    {
      name: 'Aniya Willis',
      title: 'Senior Coach',
      description: 'Aniya\'s positive attitude and coaching skills inspire athletes to reach new heights. She is dedicated to fostering growth and teamwork.',
      image: '/images/staff/aniya-placeholder.jpg'
    },
    {
      name: 'Alejandra "Alli" Arreola',
      title: 'Front Desk',
      description: 'Alli is the friendly face that welcomes families to Spirit Athletics. Her organizational skills and warm personality make everyone feel at home.',
      image: '/images/staff/alli-placeholder.jpg'
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
              Our
            </span>
            <span className="text-white"> Staff</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-300">
            Meet the dedicated team of professionals who make Spirit Athletics a place where champions are made.
          </p>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 animate-fade-in-up">
            <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Leadership Team
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
            {staffMembers.slice(0, 3).map((member, index) => (
              <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                <div className="relative mb-6">
                  <div className="w-48 h-48 mx-auto rounded-full overflow-hidden shadow-lg border-4 border-white" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                    {/* Placeholder for profile image */}
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1)' }}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{member.name}</h3>
                <p className="text-lg font-semibold mb-4" style={{ color: '#0000FE' }}>{member.title}</p>
                <p className="text-gray-600 leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coaching Staff */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 animate-fade-in-up">
            <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Coaching Staff
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {staffMembers.slice(3, 11).map((member, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 text-center animate-fade-in-up" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden shadow-lg border-4 border-white" style={{ background: 'linear-gradient(135deg, #4169E1, #0000FE)' }}>
                    {/* Placeholder for profile image */}
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{member.name}</h3>
                <p className="text-lg font-semibold mb-4" style={{ color: '#0000FE' }}>{member.title}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Staff */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 animate-fade-in-up">
            <span style={{ background: 'linear-gradient(45deg, #0000FE, #000000)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Support Staff
            </span>
          </h2>
          
          <div className="flex justify-center">
            {staffMembers.slice(11).map((member, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-gray-50 p-8 rounded-2xl shadow-lg border border-blue-100 text-center animate-fade-in-up max-w-md">
                <div className="relative mb-6">
                  <div className="w-40 h-40 mx-auto rounded-full overflow-hidden shadow-lg border-4 border-white" style={{ background: 'linear-gradient(135deg, #000000, #333333)' }}>
                    {/* Placeholder for profile image */}
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{member.name}</h3>
                <p className="text-lg font-semibold mb-4" style={{ color: '#0000FE' }}>{member.title}</p>
                <p className="text-gray-600 leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Our Team */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg, #0000FE, #4169E1, #000000)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6 animate-fade-in-up">
            Join Our Team
          </h2>
          <p className="text-xl text-gray-200 mb-8 leading-relaxed animate-fade-in-up delay-200">
            Are you passionate about cheerleading and working with young athletes? We're always looking for dedicated individuals to join our Spirit Athletics family.
          </p>
          <div className="flex justify-center animate-fade-in-up delay-300">
            <a 
              href="mailto:hdcspirit@aol.com?subject=Interest in Joining Spirit Athletics Team"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-black transition-all duration-300"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
} 