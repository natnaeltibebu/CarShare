import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { carsAPI } from "../services/api"
import CarCard from "../components/CarCard"
import SearchBar from "../components/SearchBar"
import LoadingSpinner from "../components/LoadingSpinner"
import Footer from "../components/Footer"

const Cars = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCars, setTotalCars] = useState(0)
  const carsPerPage = 12

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    location: searchParams.get("location") || "",
    category: searchParams.get("category") || "",
    available: searchParams.get("available") !== "false",
    min_price: searchParams.get("min_price") || "",
    max_price: searchParams.get("max_price") || "",
    start_date: searchParams.get("start_date") || "",
    end_date: searchParams.get("end_date") || "",
    sort: searchParams.get("sort") || "newest",
  })

  useEffect(() => {
    fetchCars()
  }, [filters, currentPage])

  const fetchCars = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        per_page: carsPerPage,
      }

      Object.keys(filters).forEach((key) => {
        if (filters[key] && filters[key] !== "") {
          params[key] = filters[key]
        }
      })

      const response = await carsAPI.getCars(params)
      setCars(response.data.cars)

      // Handle new pagination structure
      if (response.data.pagination) {
        setTotalCars(response.data.pagination.total_count)
        setTotalPages(response.data.pagination.total_pages)
      } else {
        // Fallback for backward compatibility
        setTotalCars(response.data.total || response.data.cars.length)
        setTotalPages(Math.ceil((response.data.total || response.data.cars.length) / carsPerPage))
      }
    } catch (error) {
      console.error("Error fetching cars:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value,
    }
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change

    // Update URL params
    const newParams = new URLSearchParams()
    Object.keys(newFilters).forEach((k) => {
      if (newFilters[k] && newFilters[k] !== "") {
        newParams.set(k, newFilters[k])
      }
    })
    setSearchParams(newParams)
  }

  const handleSearch = (searchData) => {
    Object.keys(searchData).forEach((key) => {
      handleFilterChange(key, searchData[key])
    })
  }

  const clearAllFilters = () => {
    const clearedFilters = {
      search: "",
      location: "",
      category: "",
      available: true,
      min_price: "",
      max_price: "",
      start_date: "",
      end_date: "",
      sort: "newest",
    }
    setFilters(clearedFilters)
    setCurrentPage(1)
    setSearchParams(new URLSearchParams())
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const categories = ["economy", "compact", "luxury", "SUV", "truck", "convertible"]
  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "popular", label: "Most Popular" },
  ]

  const hasActiveFilters = Object.values(filters).some((v) => v && v !== "newest" && v !== true)

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-gray-500">Finding the perfect cars for you...</p>
        </div>
      </div>
    )
  }

  const Pagination = () => {
    if (totalPages <= 1) return null

    const getPageNumbers = () => {
      const pages = []
      const showPages = 5
      let start = Math.max(1, currentPage - Math.floor(showPages / 2))
      const end = Math.min(totalPages, start + showPages - 1)

      if (end - start + 1 < showPages) {
        start = Math.max(1, end - showPages + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    }

    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 bg-white border-t border-gray-100">
        {/* Results info - centered and minimal */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 font-medium">
            Showing {(currentPage - 1) * carsPerPage + 1}–{Math.min(currentPage * carsPerPage, totalCars)} of{" "}
            <span className="text-gray-900 font-semibold">{totalCars.toLocaleString()}</span> cars
          </p>
        </div>

        {/* Desktop pagination controls */}
        <div className="flex items-center gap-2">
          {/* Previous button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="group flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-400 transition-all duration-200"
          >
            <svg
              className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1 mx-2">
            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`flex items-center justify-center w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  page === currentPage
                    ? "bg-black text-white shadow-lg scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="group flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-400 transition-all duration-200"
          >
            <svg
              className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Quick jump to first/last pages for large datasets */}
        {totalPages > 10 && (
          <div className="hidden sm:flex items-center gap-4 mt-4 text-sm">
            {currentPage > 5 && (
              <button
                onClick={() => handlePageChange(1)}
                className="text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
              >
                ← First page
              </button>
            )}
            {currentPage < totalPages - 4 && (
              <button
                onClick={() => handlePageChange(totalPages)}
                className="text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
              >
                Last page →
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">Find Your Perfect Ride</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover premium cars from verified hosts in your area
              </p>
            </div>

            {/* Modern Search Bar */}
            <div className="max-w-4xl mx-auto mb-8">
              <SearchBar variant="cars" onSearch={handleSearch} />
            </div>
          </div>

          {/* Controls Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    showFilters || hasActiveFilters
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    />
                  </svg>
                  Filters
                  {hasActiveFilters && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-gray-900 bg-white rounded-full">
                      {Object.values(filters).filter((v) => v && v !== "newest" && v !== true).length}
                    </span>
                  )}
                </button>

                <div className="text-sm text-gray-600 font-medium">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                      Searching...
                    </div>
                  ) : (
                    `${totalCars.toLocaleString()} car${totalCars !== 1 ? "s" : ""} available`
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Sort by</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange("sort", e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm font-medium min-w-[160px]"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Refine Your Search</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange("category", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm bg-white"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Location</label>
                    <input
                      type="text"
                      placeholder="City or address"
                      value={filters.location}
                      onChange={(e) => handleFilterChange("location", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Min Price/Day</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        placeholder="0"
                        value={filters.min_price}
                        onChange={(e) => handleFilterChange("min_price", e.target.value)}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Max Price/Day</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        placeholder="999"
                        value={filters.max_price}
                        onChange={(e) => handleFilterChange("max_price", e.target.value)}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.available}
                      onChange={(e) => handleFilterChange("available", e.target.checked)}
                      className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Show available cars only</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {cars.length === 0 && !loading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No cars found</h3>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                  We couldn't find any cars matching your criteria. Try adjusting your filters or search terms.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="p-6">
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cars.map((car) => (
                        <CarCard key={car.id} car={car} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Single Pagination at the bottom */}
                <Pagination />
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Cars
