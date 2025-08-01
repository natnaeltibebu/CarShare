import { useState } from "react"
import { Link } from "react-router-dom"

const CarCard = ({ car }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleImageLoad = () => setImageLoaded(true)
  const handleImageError = () => setImageError(true)

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      available: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
      booked: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
      maintenance: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    }

    const config = statusConfig[status] || statusConfig.available

    return (
      <div
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    )
  }

  const ImagePlaceholder = () => (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-sm font-medium">No image</p>
      </div>
    </div>
  )

  return (
    <Link to={`/cars/${car.id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
        <div className="relative h-48 overflow-hidden bg-gray-50">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse"></div>
          )}
          {car.primary_image && !imageError ? (
            <img
              src={car.primary_image || "/placeholder.svg?height=192&width=300"}
              alt={`${car.make} ${car.model}`}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <ImagePlaceholder />
          )}
          <div className="absolute top-3 left-3">
            <StatusBadge status={car.status} />
          </div>
          {car.images_count > 1 && (
            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium">
              +{car.images_count - 1} photos
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-700 transition-colors mb-1">
              {car.year} {car.make} {car.model}
            </h3>
            <p className="text-sm text-gray-500 capitalize">{car.category}</p>
          </div>

          <div className="flex items-center text-gray-500 text-sm mb-4">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="truncate">{car.pickup_location}</span>
          </div>

          <div className="mt-auto">
            <div className="flex items-baseline">
              <span className="text-xl font-semibold text-gray-900">${car.daily_rate}</span>
              <span className="text-sm text-gray-500 ml-1">per day</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default CarCard
