import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4" style={{ background: 'linear-gradient(to right, #0000FE, #4169E1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Spirit Athletics
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              We provide competitive cheerleading programs 
              for athletes of all levels, from non-competitive to Elite All-Star teams.
            </p>
            <div className="flex space-x-2">
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#0000FE' }}></span>
              <span className="inline-block w-2 h-2 bg-white rounded-full"></span>
              <span className="inline-block w-2 h-2 bg-gray-600 rounded-full"></span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6" style={{ color: '#4169E1' }}>Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/programs" className="text-gray-300 hover:text-blue-400 transition-colors text-sm flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full mr-3 group-hover:bg-white transition-colors" style={{ backgroundColor: '#0000FE' }}></span>
                  Programs
                </Link>
              </li>
              <li>
                <Link href="/parent-portal" className="text-gray-300 hover:text-blue-400 transition-colors text-sm flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full mr-3 group-hover:bg-white transition-colors" style={{ backgroundColor: '#0000FE' }}></span>
                  Parent Portal
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="text-gray-300 hover:text-blue-400 transition-colors text-sm flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full mr-3 group-hover:bg-white transition-colors" style={{ backgroundColor: '#0000FE' }}></span>
                  Calendar
                </Link>
              </li>
              <li>
                <Link href="/forms" className="text-gray-300 hover:text-blue-400 transition-colors text-sm flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full mr-3 group-hover:bg-white transition-colors" style={{ backgroundColor: '#0000FE' }}></span>
                  Forms
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-blue-400 transition-colors text-sm flex items-center group">
                  <span className="w-1.5 h-1.5 rounded-full mr-3 group-hover:bg-white transition-colors" style={{ backgroundColor: '#0000FE' }}></span>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media & Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6" style={{ color: '#4169E1' }}>Connect With Us</h4>
            <div className="flex space-x-4 mb-6">
              {/* Social media icons with Spirit Athletics colors */}
              <a
                href="#"
                className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 transform"
                style={{ background: 'linear-gradient(135deg, #0000FE, #0000CC)' }}
                aria-label="Facebook"
              >
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 transform"
                style={{ background: 'linear-gradient(135deg, #000000, #333333)' }}
                aria-label="Instagram"
              >
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.875-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 transform"
                style={{ background: 'linear-gradient(135deg, #4169E1, #0000FE)' }}
                aria-label="YouTube"
              >
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
            <p className="text-gray-300 text-sm">
              Follow us for updates, photos, and team achievements!
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Spirit Athletics. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0 flex items-center">
              <span className="w-2 h-2 rounded-full mr-2" style={{ background: 'linear-gradient(to right, #0000FE, #FFFFFF)' }}></span>
              Building Champions Since 1998
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 