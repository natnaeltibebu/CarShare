import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import SearchBar from "../components/SearchBar"
import Footer from "../components/Footer"

const Home = () => {
  const { user } = useAuth()

  return (
    <>
      <div className="min-h-screen bg-white overflow-hidden">
        {/* Hero Section */}
        <div className="relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-white to-gray-50/30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.02),transparent_70%),radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.02),transparent_70%)]" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
            <div className="text-center mb-16">
              {/* Floating badge */}
              <div className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 mb-8 shadow-sm">
                <div className="w-2 h-2 bg-black rounded-full mr-2" />
                Trusted by 50,000+ drivers worldwide
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
                Drive the
                <br />
                <span
                  className="text-gray-900 font-bold"
                  style={{
                    background: "linear-gradient(135deg, #000000 0%, #404040 50%, #000000 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    color: "#000000", // fallback color
                  }}
                >
                  extraordinary
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12 font-light">
                Discover premium cars shared by verified hosts. From weekend getaways to business trips, find your
                perfect ride in seconds.
              </p>
            </div>

            {/* Enhanced SearchBar */}
            <div className="mb-16 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-gray-100/50 to-gray-200/50 rounded-3xl blur-xl" />
              <div className="relative">
                <SearchBar variant="hero" />
              </div>
            </div>

            {!user && (
              <div className="text-center">
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link
                    to="/register?role=renter"
                    className="group inline-flex items-center justify-center px-8 py-4 bg-black text-white font-semibold rounded-2xl hover:bg-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    Start Your Journey
                    <svg
                      className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link
                    to="/register?role=host"
                    className="group inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-2xl border border-gray-200 hover:bg-gray-50 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    Earn with Your Car
                    <svg
                      className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Component */}
      <Footer />
    </>
  )
}

export default Home
