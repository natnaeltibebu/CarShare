import { useState } from "react"
import { useNavigate } from "react-router-dom"

const SearchBar = ({ onSearch, className = "", variant = "default" }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    location: "",
    start_date: "",
    end_date: "",
  })
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()

    if (variant === "cars") {
      // For cars page - simple search
      if (onSearch) {
        onSearch({ search: searchQuery })
      }
      return
    }

    // For hero variant - full search with dates
    const searchData = {
      search: searchQuery,
      ...filters,
    }

    if (onSearch) {
      onSearch(searchData)
    } else {
      const params = new URLSearchParams()
      Object.keys(searchData).forEach((key) => {
        if (searchData[key]) params.set(key, searchData[key])
      })
      navigate(`/cars?${params.toString()}`)
    }
  }

  // Modern single-field search for Cars page
  if (variant === "cars") {
    return (
      <div className={`w-full ${className}`}>
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400 group-focus-within:text-gray-600 transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by car make, model, or features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-14 pr-32 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 text-base font-medium shadow-sm hover:shadow-md group-focus-within:shadow-lg"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                type="submit"
                className="h-8 px-6 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Search
              </button>
            </div>
          </div>

          {/* Search suggestions/hints */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-gray-500 font-medium">Try:</span>
            {["Tesla Model 3", "BMW", "Luxury", "SUV"].map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSearchQuery(suggestion)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-full transition-colors duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </form>
      </div>
    )
  }

  if (variant === "hero") {
    return (
      <div className={`w-full max-w-2xl mx-auto px-4 ${className}`}>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          {/* Desktop Layout */}
          <div className="hidden md:flex md:gap-2">
            {/* Location Input - 1/3 width */}
            <div className="flex-1">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Where?"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full h-12 pl-10 pr-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Pickup Date - 1/3 width */}
            <div className="flex-1">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={filters.start_date}
                  onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                  className="w-full h-12 pl-10 pr-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Return Date - 1/3 width */}
            <div className="flex-1">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <input
                  type="date"
                  min={filters.start_date || new Date().toISOString().split("T")[0]}
                  value={filters.end_date}
                  onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                  className="w-full h-12 pl-10 pr-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

          {/* Search Button - Desktop (full width, separate row) */}
          <div className="hidden md:block mt-3">
            <button
              type="submit"
              className="w-full h-12 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
            >
              Search Cars
            </button>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            {/* Location Input */}
            <div className="relative mb-3">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Where?"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full h-10 pl-10 pr-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Pickup Date */}
            <div className="relative mb-3">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                className="w-full h-10 pl-10 pr-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Return Date */}
            <div className="relative mb-4">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <input
                type="date"
                min={filters.start_date || new Date().toISOString().split("T")[0]}
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                className="w-full h-10 pl-10 pr-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Search Button - Mobile */}
            <button
              type="submit"
              className="w-full h-10 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
            >
              Search Cars
            </button>
          </div>
        </form>
      </div>
    )
  }

  // Compact version for other pages (legacy)
  return (
    <form onSubmit={handleSubmit} className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm ${className}`}>
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search cars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
        >
          Search
        </button>
      </div>
    </form>
  )
}

export default SearchBar
