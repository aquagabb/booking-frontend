import { useEffect, useState } from 'react'
import Search from '../components/Search'
import RestaurantCard from '../components/shared/RestaurantCard'
import { getHomePageLocations } from '../api/locations/locations'

const Home = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])

  useEffect(() => {
    const fetchHomePageLocations = async () => {
      try {
        setIsLoading(true)
        const { response } = await getHomePageLocations()
        setResults(response?.data || [])
      } catch (err) {
        console.error('Error fetching homepage locations:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHomePageLocations()
  }, [])

  return (
    <div>
      {/* implement here Hero section */}
      <div className="-8 text-center">
        <h1 className="text-4xl font-bold">Discover Perfect Venues for Your Events</h1>
        <p className="mt-4 mb-4 ">Find and book ideal locations for weddings, parties, corporate events, and private gatherings</p>
      </div>
      <Search />

      <main className="">
        {!isLoading && results.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold mb-6">Exploring Venues</h2>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {results.map((loc) => (
              <RestaurantCard
                key={loc.id}
                name={loc.name}
                slug={loc.slug}
                address={loc.address}
                rating={parseFloat(loc.rating)}
                ratingCount={loc.ratingCount}
                maxGuests={loc.maxGuests}
                photos={loc.photos}
                locationId={loc.id}
                viewFavorite={true}
                pricing={loc.pricing}
                pricingCategories={loc.pricingCategories}
              />
            ))}
            </div>
          </>
        ) : !isLoading ? (
          <p className="text-gray-400 text-center">
            No locations found.
          </p>
        ) : (
          <p className="text-gray-400 text-center">
            Loading locations...
          </p>
        )}
      </main>

      {/* List Your Venue Promotional Section */}
      <div className="mx-auto pb-16 mt-16">
        <div className="bg-white rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12 border border-gray-100">
          {/* Left Section - City Skyline Illustration */}
          <div className="flex-shrink-0 w-full md:w-1/2 flex justify-center md:justify-start">
            <svg
              width="300"
              height="200"
              viewBox="0 0 300 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full max-w-sm"
            >
              {/* Clouds */}
              <path
                d="M40 30 Q45 25 50 30 Q55 25 60 30"
                stroke="#000"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M80 25 Q85 20 90 25 Q95 20 100 25"
                stroke="#000"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M120 35 Q125 30 130 35 Q135 30 140 35"
                stroke="#000"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
              
              {/* Wind lines */}
              <line x1="50" y1="20" x2="70" y2="20" stroke="#000" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="90" y1="15" x2="110" y2="15" stroke="#000" strokeWidth="1" strokeDasharray="3,3" />
              
              {/* Building 1 - Left */}
              <rect x="20" y="80" width="25" height="100" stroke="#000" strokeWidth="2" fill="none" />
              <line x1="25" y1="100" x2="40" y2="100" stroke="#000" strokeWidth="1" />
              <line x1="25" y1="120" x2="40" y2="120" stroke="#000" strokeWidth="1" />
              <line x1="25" y1="140" x2="40" y2="140" stroke="#000" strokeWidth="1" />
              <rect x="28" y="85" width="6" height="8" fill="#f6536c" />
              
              {/* Building 2 */}
              <rect x="50" y="60" width="30" height="120" stroke="#000" strokeWidth="2" fill="none" />
              <line x1="55" y1="80" x2="75" y2="80" stroke="#000" strokeWidth="1" />
              <line x1="55" y1="100" x2="75" y2="100" stroke="#000" strokeWidth="1" />
              <line x1="55" y1="120" x2="75" y2="120" stroke="#000" strokeWidth="1" />
              <line x1="55" y1="140" x2="75" y2="140" stroke="#000" strokeWidth="1" />
              <rect x="58" y="65" width="6" height="8" fill="#f6536c" />
              <rect x="66" y="65" width="6" height="8" fill="#f6536c" />
              
              {/* Building 3 - Tall */}
              <rect x="85" y="40" width="35" height="140" stroke="#000" strokeWidth="2" fill="none" />
              <line x1="90" y1="60" x2="115" y2="60" stroke="#000" strokeWidth="1" />
              <line x1="90" y1="80" x2="115" y2="80" stroke="#000" strokeWidth="1" />
              <line x1="90" y1="100" x2="115" y2="100" stroke="#000" strokeWidth="1" />
              <line x1="90" y1="120" x2="115" y2="120" stroke="#000" strokeWidth="1" />
              <line x1="90" y1="140" x2="115" y2="140" stroke="#000" strokeWidth="1" />
              <line x1="90" y1="160" x2="115" y2="160" stroke="#000" strokeWidth="1" />
              <rect x="95" y="45" width="8" height="10" fill="#f6536c" />
              <rect x="105" y="45" width="8" height="10" fill="#f6536c" />
              
              {/* Building 4 */}
              <rect x="125" y="70" width="28" height="110" stroke="#000" strokeWidth="2" fill="none" />
              <line x1="130" y1="90" x2="148" y2="90" stroke="#000" strokeWidth="1" />
              <line x1="130" y1="110" x2="148" y2="110" stroke="#000" strokeWidth="1" />
              <line x1="130" y1="130" x2="148" y2="130" stroke="#000" strokeWidth="1" />
              <line x1="130" y1="150" x2="148" y2="150" stroke="#000" strokeWidth="1" />
              <rect x="133" y="75" width="6" height="8" fill="#f6536c" />
              
              {/* Building 5 - Tall */}
              <rect x="158" y="50" width="32" height="130" stroke="#000" strokeWidth="2" fill="none" />
              <line x1="163" y1="70" x2="185" y2="70" stroke="#000" strokeWidth="1" />
              <line x1="163" y1="90" x2="185" y2="90" stroke="#000" strokeWidth="1" />
              <line x1="163" y1="110" x2="185" y2="110" stroke="#000" strokeWidth="1" />
              <line x1="163" y1="130" x2="185" y2="130" stroke="#000" strokeWidth="1" />
              <line x1="163" y1="150" x2="185" y2="150" stroke="#000" strokeWidth="1" />
              <rect x="168" y="55" width="8" height="10" fill="#f6536c" />
              <rect x="178" y="55" width="8" height="10" fill="#f6536c" />
              
              {/* Building 6 */}
              <rect x="195" y="85" width="25" height="95" stroke="#000" strokeWidth="2" fill="none" />
              <line x1="200" y1="105" x2="215" y2="105" stroke="#000" strokeWidth="1" />
              <line x1="200" y1="125" x2="215" y2="125" stroke="#000" strokeWidth="1" />
              <line x1="200" y1="145" x2="215" y2="145" stroke="#000" strokeWidth="1" />
              
              {/* Building 7 */}
              <rect x="225" y="75" width="30" height="105" stroke="#000" strokeWidth="2" fill="none" />
              <line x1="230" y1="95" x2="250" y2="95" stroke="#000" strokeWidth="1" />
              <line x1="230" y1="115" x2="250" y2="115" stroke="#000" strokeWidth="1" />
              <line x1="230" y1="135" x2="250" y2="135" stroke="#000" strokeWidth="1" />
              <line x1="230" y1="155" x2="250" y2="155" stroke="#000" strokeWidth="1" />
              <rect x="235" y="80" width="6" height="8" fill="#f6536c" />
              <rect x="243" y="80" width="6" height="8" fill="#f6536c" />
              
              {/* Building 8 - Right */}
              <rect x="260" y="90" width="20" height="90" stroke="#000" strokeWidth="2" fill="none" />
              <line x1="265" y1="110" x2="275" y2="110" stroke="#000" strokeWidth="1" />
              <line x1="265" y1="130" x2="275" y2="130" stroke="#000" strokeWidth="1" />
              <line x1="265" y1="150" x2="275" y2="150" stroke="#000" strokeWidth="1" />
              
              {/* Ground line */}
              <line x1="0" y1="180" x2="300" y2="180" stroke="#000" strokeWidth="2" />
              
              {/* Small trees/bushes */}
              <circle cx="15" cy="175" r="4" fill="#000" />
              <circle cx="35" cy="175" r="3" fill="#000" />
              <circle cx="270" cy="175" r="4" fill="#000" />
            </svg>
          </div>

          {/* Right Section - Text and CTA */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              List your venue for free and get more bookings!
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              We are the world's fastest-growing online marketplace for venue hire, giving you direct access to the right customers.
            </p>
            <button
              className="bg-[#FF5C6C] hover:bg-[#FF4A5A] text-white font-semibold py-4 px-8 rounded-xl text-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              style={{ backgroundColor: '#FF5C6C' }}
            >
              List your venue
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto pb-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Global Exposure Card */}
          <div className="bg-white rounded-xl p-6  border border-gray-100  transition-shadow">
            <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                  fill="#7C3AED"
                />
                <path
                  d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM11 16.93C8.61 16.59 7 14.42 7 12C7 9.58 8.61 7.41 11 7.07V16.93ZM13 16.93V7.07C15.39 7.41 17 9.58 17 12C17 14.42 15.39 16.59 13 16.93Z"
                  fill="#7C3AED"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Global Exposure</h3>
            <p className="text-gray-600 leading-relaxed">
              Your venue gets seen by thousands of daily users searching for the perfect spot.
            </p>
          </div>

          {/* Easy Management Card */}
          <div className="bg-white rounded-xl p-6 border border-gray-100  transition-shadow">
            <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 4H10V10H4V4ZM14 4H20V10H14V4ZM4 14H10V20H4V14ZM14 14H20V20H14V14Z"
                  fill="#7C3AED"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Manage your bookings</h3>
            <p className="text-gray-600 leading-relaxed">
              Manage availability, pricing, and bookings from one intuitive dashboard.
            </p>
          </div>

          {/* Secure Payments Card */}
          <div className="bg-white rounded-xl p-6  border border-gray-100  transition-shadow">
            <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                  fill="#7C3AED"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Real-time Availability</h3>
            <p className="text-gray-600 leading-relaxed">
              Check availability instanlty and book your preffered date withjout waiting for manual confirmations..
            </p>
          </div>

          {/* 24/7 Support Card */}
          <div className="bg-white rounded-xl p-6  border border-gray-100  transition-shadow">
            <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="6" cy="12" r="4" fill="#7C3AED" />
                <circle cx="18" cy="12" r="4" fill="#7C3AED" />
                <path
                  d="M10 12C10 10.9 9.1 10 8 10H4C2.9 10 2 10.9 2 12V16C2 17.1 2.9 18 4 18H6C7.1 18 8 17.1 8 16V12ZM14 12C14 10.9 14.9 10 16 10H20C21.1 10 22 10.9 22 12V16C22 17.1 21.1 18 20 18H18C16.9 18 16 17.1 16 16V12Z"
                  fill="#7C3AED"
                />
                <path
                  d="M10 12L14 12"
                  stroke="#7C3AED"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">24/7 Support</h3>
            <p className="text-gray-600 leading-relaxed">
              Our dedicated team is here to help you succeed every step of the way.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home