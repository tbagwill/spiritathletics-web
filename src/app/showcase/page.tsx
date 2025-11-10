import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Fall Showcase 2025 - Spirit Athletics",
  description: "Join us for the Spirit Athletics Fall Showcase 2025 - our annual, local event showcasing athletes' first public performance of the season!",
};

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-float"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white rounded-full animate-float-delayed"></div>
          <div className="absolute top-40 right-40 w-16 h-16 bg-white rounded-full animate-float-slow"></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-block bg-yellow-400 text-blue-900 px-6 py-2 rounded-full font-bold text-sm mb-4 animate-pulse-slow">
            🎉 HAPPENING THIS WEEK!
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">
            Spirit Athletics<br />
            <span className="text-yellow-400">Fall Showcase 2025</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            The Premier High Desert Cheer Event of the Season
          </p>
        </div>
      </section>

      {/* Quick Event Info Banner */}
      <section className="bg-yellow-400 py-6 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white bg-opacity-90 rounded-lg p-4 shadow-md">
              <div className="text-blue-900 font-bold text-sm mb-1">📍 LOCATION</div>
              <div className="text-gray-800 font-semibold">Granite Hills High School</div>
            </div>
            <div className="bg-white bg-opacity-90 rounded-lg p-4 shadow-md">
              <div className="text-blue-900 font-bold text-sm mb-1">🎟️ TICKETING OPENS</div>
              <div className="text-gray-800 font-semibold">11:30 AM</div>
            </div>
            <div className="bg-white bg-opacity-90 rounded-lg p-4 shadow-md">
              <div className="text-blue-900 font-bold text-sm mb-1">🚪 DOORS OPEN</div>
              <div className="text-gray-800 font-semibold">12:15 PM</div>
            </div>
            <div className="bg-white bg-opacity-90 rounded-lg p-4 shadow-md">
              <div className="text-blue-900 font-bold text-sm mb-1">⭐ SHOWTIME</div>
              <div className="text-gray-800 font-semibold">1:00 PM</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* What is the Showcase */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8 border-t-4 border-blue-600">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              🌟 What is the Spirit Showcase?
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              The <strong>Spirit Showcase</strong> is our highly anticipated annual event, proudly hosted right here in the High Desert! 
              This electrifying celebration marks the debut of our talented athletes' first public performance of the season—a moment 
              you won't want to miss!
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Beyond the stunning performances, the Showcase is a full experience featuring <strong>local vendors</strong>, 
              <strong> interactive games</strong>, and <strong>non-stop entertainment</strong> for the whole family. 
              Whether you're here to cheer on your athlete or simply enjoy the spectacle, this event promises excitement at every turn!
            </p>
          </div>

          {/* Event Details */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-xl p-8 md:p-12 mb-8 border-l-8 border-blue-600">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
              📋 Event Details & Schedule
            </h2>
            
            <div className="space-y-6">
              {/* Location */}
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center">
                  <span className="text-2xl mr-3">📍</span> Location
                </h3>
                <p className="text-lg text-gray-800 font-semibold">Granite Hills High School</p>
                <p className="text-gray-600 mt-1">22900 Esaws Rd, Apple Valley, CA 92307</p>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                  <span className="text-2xl mr-3">🕐</span> Event Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="bg-blue-600 text-white font-bold rounded-lg px-4 py-2 mr-4 min-w-[120px] text-center">
                      11:30 AM
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Athlete Drop-Off</div>
                      <div className="text-gray-600 text-sm">Athletes must arrive for check-in and preparation</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-600 text-white font-bold rounded-lg px-4 py-2 mr-4 min-w-[120px] text-center">
                      11:30 AM
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Ticketing Opens</div>
                      <div className="text-gray-600 text-sm">Box office opens for ticket purchases and will-call pickup</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-yellow-500 text-gray-900 font-bold rounded-lg px-4 py-2 mr-4 min-w-[120px] text-center">
                      12:15 PM
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Doors Open</div>
                      <div className="text-gray-600 text-sm">Spectators may enter the venue and find seating</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-green-600 text-white font-bold rounded-lg px-4 py-2 mr-4 min-w-[120px] text-center">
                      1:00 PM
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">SHOWTIME! ⭐</div>
                      <div className="text-gray-600 text-sm">The performances begin—get ready to cheer!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* IMPORTANT: Ticketing Information */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl shadow-xl p-8 md:p-12 mb-8 border-4 border-red-500">
            <div className="flex items-center mb-6">
              <span className="text-5xl mr-4">🎟️</span>
              <h2 className="text-3xl md:text-4xl font-bold text-red-900">
                IMPORTANT: Ticketing Information
              </h2>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📱 Purchase Tickets in Advance</h3>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                Skip the lines and secure your spot! Purchase your tickets ahead of time through our official ticketing partner.
              </p>
              <a 
                href="https://buytickets.at/spiritathletics/1936402" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold px-8 py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🎫 BUY TICKETS NOW →
              </a>
            </div>

            <div className="bg-yellow-100 border-l-4 border-yellow-600 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-bold text-yellow-900 mb-3">⚠️ PLEASE READ CAREFULLY</h3>
              <ul className="space-y-3 text-gray-800">
                <li className="flex items-start">
                  <span className="text-yellow-600 font-bold mr-2 text-xl">•</span>
                  <span className="text-base"><strong>QR Code Delivery:</strong> Each ticket purchased will generate a UNIQUE QR code sent to your email</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 font-bold mr-2 text-xl">•</span>
                  <span className="text-base"><strong>Check-In Process:</strong> Upon arrival, present your QR code(s) to our staff for scanning</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 font-bold mr-2 text-xl">•</span>
                  <span className="text-base"><strong>Wristband Required:</strong> After check-in, you will receive a wristband for venue entry and re-entry</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 font-bold mr-2 text-xl">•</span>
                  <span className="text-base"><strong>Tickets are Available at the Venue:</strong> It is possible to purchase tickets at the venue, but you may be subject to waiting in line outdoors.</span>
                </li>
              </ul>
            </div>

            <div className="bg-red-100 border-l-4 border-red-600 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-red-900 mb-3">🚨 MANDATORY ENTRY REQUIREMENT</h3>
              <p className="text-lg text-red-900 font-bold mb-2">
                ALL SPECTATORS AND NON-PERFORMING PERSONNEL MUST HAVE A WRISTBAND
              </p>
              <p className="text-base text-gray-800">
                Wristbands are REQUIRED for initial entry and any re-entry to the venue. No exceptions. 
                Please ensure you have your wristband secured at all times during the event.
              </p>
            </div>
          </div>

          {/* What to Expect */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              ✨ What to Expect
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-3">🎭 Live Performances</h3>
                <p className="text-gray-700">
                  Watch our talented athletes showcase their skills in their season debut! From tumbling to stunts to perfectly synchronized routines, 
                  prepare to be amazed.
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                <h3 className="text-xl font-bold text-purple-900 mb-3">🛍️ Vendors & Merchandise</h3>
                <p className="text-gray-700">
                  Browse local vendors offering Spirit Athletics merchandise, cheer gear, snacks, and more! Support local businesses while enjoying the show.
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                <h3 className="text-xl font-bold text-green-900 mb-3">🎮 Games & Activities</h3>
                <p className="text-gray-700">
                  Keep the whole family entertained with interactive games and activities throughout the venue. Fun for all ages!
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
                <h3 className="text-xl font-bold text-orange-900 mb-3">📸 Photo Opportunities</h3>
                <p className="text-gray-700">
                  Capture memories with our photo backdrop areas and celebrate your athlete's special day!
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl p-8 md:p-12 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
              ❓ Frequently Asked Questions
            </h2>

            <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="font-bold text-lg text-blue-900 mb-2">What should my athlete wear?</h3>
                <p className="text-gray-700">
                  Our non-competitive program will be wearing their uniforms. For All-Star athletes, please refer to your team parent as each team may require specific attire.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="font-bold text-lg text-blue-900 mb-2">What should I bring?</h3>
                <p className="text-gray-700">
                  If you already purchased your tickets, please bring your confirmation details with you. Otherwise, we have plenty of food, drinks and gifts available for purchase. Don't forget to bring your enthusiasm and support to cheer on our wonderful athletes and all their hard work!
                </p>
              </div>
            
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="font-bold text-lg text-blue-900 mb-2">Do I need to buy tickets in advance?</h3>
                <p className="text-gray-700">
                  While tickets will be available at the door (if not sold out), we <strong>strongly recommend</strong> purchasing in advance 
                  to avoid long wait times and ensure entry. Pre-purchased tickets guarantee your spot!
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="font-bold text-lg text-blue-900 mb-2">What if I lose my wristband?</h3>
                <p className="text-gray-700">
                  Wristbands are non-transferable and non-replaceable. Please keep your wristband secure throughout the event. 
                  If removed, you will need to purchase a new ticket for re-entry.
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="font-bold text-lg text-blue-900 mb-2">Is seating reserved?</h3>
                <p className="text-gray-700">
                  Seating is general admission on a first-come, first-served basis. We recommend arriving when doors open (12:15 PM) 
                  to secure your preferred seating area.
                </p>
              </div>
            </div>
          </div>

          {/* Event Guidelines & Code of Conduct */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-8 md:p-12 mb-8 border-l-8 border-purple-600">
            <div className="flex items-center mb-6">
              <span className="text-4xl mr-4">🤝</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Event Guidelines & Code of Conduct
              </h2>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md mb-4">
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                The Spirit Athletics Fall Showcase is a celebration of our athletes' hard work, dedication, and talent. 
                To ensure a positive, supportive, and stress-free environment for all participants, spectators, and staff, 
                we ask that all attendees adhere to our event guidelines.
              </p>
            </div>

            <div className="bg-purple-100 border-l-4 border-purple-600 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center">
                <span className="mr-2">⚠️</span> Expected Behavior
              </h3>
              <ul className="space-y-3 text-gray-800">
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-2">•</span>
                  <span className="text-base"><strong>Respectful Conduct:</strong> Treat all athletes, staff, vendors, and fellow spectators with courtesy and respect</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-2">•</span>
                  <span className="text-base"><strong>Positive Support:</strong> Encourage and support all performing teams in a positive manner</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-2">•</span>
                  <span className="text-base"><strong>Staff Cooperation:</strong> Follow all instructions from Spirit Athletics staff and venue personnel</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-2">•</span>
                  <span className="text-base"><strong>Venue Rules:</strong> Comply with all Granite Hills High School facility rules and regulations</span>
                </li>
              </ul>
            </div>

            <div className="bg-red-100 border-l-4 border-red-600 p-6 rounded-lg mt-4">
              <h3 className="text-xl font-bold text-red-900 mb-3 flex items-center">
                <span className="mr-2">🚫</span> Zero Tolerance Policy
              </h3>
              <p className="text-base text-red-900 font-bold mb-3">
                Any person causing aggressive behavior, disruptions, or failing to comply with staff instructions will be subject to immediate removal from the event.
              </p>
              <p className="text-base text-gray-800 mb-3">
                This includes, but is not limited to:
              </p>
              <ul className="space-y-2 text-gray-800 ml-4">
                <li className="flex items-start">
                  <span className="text-red-600 font-bold mr-2">•</span>
                  <span className="text-sm">Verbal or physical altercations of any kind</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 font-bold mr-2">•</span>
                  <span className="text-sm">Aggressive or threatening behavior toward staff, athletes, or attendees</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 font-bold mr-2">•</span>
                  <span className="text-sm">Refusal to follow staff instructions or venue policies</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 font-bold mr-2">•</span>
                  <span className="text-sm">Disruptive behavior that interferes with performances or other attendees' enjoyment</span>
                </li>
              </ul>
              <p className="text-base text-gray-800 mt-4">
                <strong>Please note:</strong> Removal from the event is at the sole discretion of Spirit Athletics staff. 
                No refunds will be issued for individuals removed for violating event policies.
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 mt-4 border border-purple-200">
              <p className="text-base text-gray-800 text-center leading-relaxed">
                <strong className="text-purple-900">Our Commitment:</strong> We are dedicated to creating a supportive, 
                welcoming atmosphere where athletes can perform their best and families can celebrate together. 
                Your cooperation in maintaining a positive environment is greatly appreciated and essential to our success.
              </p>
            </div>
          </div>

          {/* Final Reminder */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              📢 Important Reminder
            </h2>
            <p className="text-xl mb-6 leading-relaxed">
              This information has been provided well in advance to ensure all families are informed and prepared. 
              Please review all details carefully to ensure a smooth and enjoyable experience for everyone.
            </p>
            <p className="text-lg text-blue-200">
              We're excited to see you there and showcase the incredible talent of our Spirit Athletics family!
            </p>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <a 
              href="https://buytickets.at/spiritathletics/1936402" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold text-xl px-12 py-6 rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 shadow-2xl mb-4"
            >
              🎫 GET YOUR TICKETS NOW
            </a>
            <p className="text-gray-600 mt-4">
              <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
                ← Back to Home
              </Link>
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}

