import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { carsAPI, bookingsAPI } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import LoadingSpinner from "../components/LoadingSpinner"
import Footer from "../components/Footer"

const CarDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [bookingData, setBookingData] = useState({
    start_date: "",
    end_date: "",
  })
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchCar()
  }, [id])

  const fetchCar = async () => {
    try {
      const response = await carsAPI.getCar(id)
      setCar(response.data.car)
    } catch (error) {
      console.error("Error fetching car:", error)
      setError("Car not found")
    } finally {
      setLoading(false)
    }
  }

  const showAlert = (message) => {
    const modal = document.createElement("div")
    modal.className = "fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4 border">
        <p class="text-gray-900 mb-4">${message}</p>
        <button class="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-200 ok-btn">OK</button>
      </div>
    `
    modal.querySelector(".ok-btn").onclick = () => modal.remove()
    document.body.appendChild(modal)
  }

  const handleBooking = async (e) => {
    e.preventDefault()

    if (!user) {
      navigate("/login", { state: { from: { pathname: `/cars/${id}` } } })
      return
    }

    setBookingLoading(true)
    setError("")
    setSuccess("")

    try {
      await bookingsAPI.createBooking({
        car_id: Number.parseInt(id),
        start_date: bookingData.start_date,
        end_date: bookingData.end_date,
      })

      setSuccess("Booking created successfully!")
      showAlert("Your booking has been created successfully!")
      setBookingData({ start_date: "", end_date: "" })
      fetchCar()
    } catch (error) {
      const errorMsg = error.response?.data?.errors?.join(", ") || "Booking failed"
      setError(errorMsg)
      showAlert(`Error: ${errorMsg}`)
    } finally {
      setBookingLoading(false)
    }
  }

  const calculateDays = () => {
    if (bookingData.start_date && bookingData.end_date) {
      const start = new Date(bookingData.start_date)
      const end = new Date(bookingData.end_date)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    }
    return 0
  }

  const totalPrice = calculateDays() * (car?.daily_rate || 0)
  const serviceFee = 20
  const insurance = 15
  const finalTotal = totalPrice + serviceFee + insurance

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!car) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Car Not Found</h2>
          <button
            onClick={() => navigate("/cars")}
            className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 hover:-translate-y-0.5 shadow-md hover:shadow-lg"
          >
            Back to Cars
          </button>
        </div>
      </div>
    )
  }

  const images = car.images || []
  const hasMultipleImages = images.length > 1

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      available: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200", label: "Available" },
      booked: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200", label: "Booked" },
      maintenance: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200", label: "Maintenance" },
    }

    const config = statusConfig[status] || statusConfig.available

    return (
      <div
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
      >
        {config.label}
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <style jsx>{`
          :root {
            --primary: #000000;
            --primary-light: #f3f4f6;
            --primary-dark: #1a1a1a;
            --dark: #111827;
            --gray-900: #1F2937;
            --gray-800: #374151;
            --gray-700: #4B5563;
            --gray-500: #6B7280;
            --gray-300: #D1D5DB;
            --gray-200: #E5E7EB;
            --gray-100: #F3F4F6;
            --gray-50: #F9FAFB;
            --white: #FFFFFF;
            --success: #10B981;
            --warning: #FBBF24;
            --error: #EF4444;
            --radius-sm: 6px;
            --radius-md: 10px;
            --radius-lg: 16px;
            --radius-xl: 24px;
            --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            --transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .car-detail-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 2.5rem;
          }
          
          .car-gallery {
            background: var(--white);
            border-radius: var(--radius-lg);
            overflow: hidden;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--gray-100);
          }
          
          .main-image {
            width: 100%;
            aspect-ratio: 16/9;
            position: relative;
          }
          
          .main-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .gallery-badge {
            position: absolute;
            top: 1.5rem;
            left: 1.5rem;
            z-index: 10;
          }
          
          .thumbnails {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.75rem;
            padding: 1.5rem;
          }
          
          .thumbnail {
            aspect-ratio: 4/3;
            border-radius: var(--radius-md);
            overflow: hidden;
            cursor: pointer;
            transition: var(--transition);
            border: 2px solid transparent;
          }
          
          .thumbnail:hover {
            transform: translateY(-2px);
          }
          
          .thumbnail.active {
            border-color: var(--primary);
          }
          
          .thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .car-info {
            padding-bottom: 2rem;
          }
          
          .car-name {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            letter-spacing: -0.025em;
          }
          
          .car-subtitle {
            font-size: 1.125rem;
            color: var(--gray-500);
            margin-bottom: 1.5rem;
          }
          
          .rating-location {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            margin-bottom: 2rem;
          }
          
          .rating {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--gray-700);
          }
          
          .rating-stars {
            display: flex;
            align-items: center;
            color: var(--warning);
          }
          
          .location {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--gray-700);
          }
          
          .feature-section {
            margin-bottom: 2rem;
          }
          
          .section-title {
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--gray-900);
          }
          
          .features-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          
          .feature-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            background-color: var(--gray-50);
            padding: 1rem;
            border-radius: var(--radius-md);
            border: 1px solid var(--gray-100);
          }
          
          .feature-icon {
            width: 32px;
            height: 32px;
            background-color: var(--gray-100);
            color: var(--primary);
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          
          .feature-text {
            display: flex;
            flex-direction: column;
          }
          
          .feature-label {
            font-size: 0.75rem;
            color: var(--gray-500);
          }
          
          .feature-value {
            font-weight: 500;
            color: var(--gray-900);
          }
          
          .description {
            color: var(--gray-700);
            line-height: 1.7;
            margin-bottom: 2rem;
          }
          
          .car-owner {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 2rem;
            padding: 1.5rem;
            background-color: var(--gray-50);
            border-radius: var(--radius-lg);
            border: 1px solid var(--gray-100);
          }
          
          .owner-avatar {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            overflow: hidden;
            flex-shrink: 0;
            background-color: var(--primary);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 1.5rem;
          }
          
          .owner-details {
            flex-grow: 1;
          }
          
          .owner-name {
            font-weight: 600;
            margin-bottom: 0.25rem;
          }
          
          .owner-since {
            font-size: 0.875rem;
            color: var(--gray-500);
            margin-bottom: 0.5rem;
          }
          
          .booking-card {
            background-color: var(--white);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-xl);
            border: 1px solid var(--gray-100);
            position: sticky;
            top: 100px;
            overflow: hidden;
          }
          
          .booking-header {
            padding: 1.5rem;
            border-bottom: 1px solid var(--gray-100);
          }
          
          .booking-price {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--gray-900);
            display: flex;
            align-items: baseline;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
          }
          
          .price-period {
            font-size: 1rem;
            font-weight: 400;
            color: var(--gray-500);
          }
          
          .booking-form {
            padding: 1.5rem;
          }
          
          .form-group {
            margin-bottom: 1.25rem;
          }
          
          .form-label {
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            margin-bottom: 0.5rem;
            color: var(--gray-700);
          }
          
          .date-inputs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
            margin-bottom: 1rem;
          }
          
          .date-input, .form-select, .form-textarea {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid var(--gray-200);
            border-radius: var(--radius-md);
            font-size: 0.875rem;
            transition: var(--transition);
            font-family: inherit;
          }
          
          .date-input:focus, .form-select:focus, .form-textarea:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
          }
          
          .booking-summary {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid var(--gray-100);
          }
          
          .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.75rem;
            font-size: 0.9375rem;
          }
          
          .summary-item.total {
            font-weight: 600;
            color: var(--gray-900);
            margin-top: 0.75rem;
            padding-top: 0.75rem;
            border-top: 1px dashed var(--gray-200);
          }
          
          .book-now-btn {
            width: 100%;
            padding: 1rem;
            background-color: var(--primary);
            color: var(--white);
            border: none;
            border-radius: var(--radius-md);
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: var(--transition);
            margin-top: 1.5rem;
            text-decoration: none;
            text-align: center;
          }
          
          .book-now-btn:hover {
            background-color: var(--primary-dark);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          }
          
          .book-now-btn:disabled {
            background-color: var(--gray-300);
            cursor: not-allowed;
            transform: none;
          }
          
          .booking-note {
            text-align: center;
            color: var(--gray-500);
            font-size: 0.8125rem;
            margin-top: 1rem;
          }
          
          @media (max-width: 991px) {
            .car-detail-grid {
              grid-template-columns: 1fr;
            }
            
            .booking-card {
              position: static;
              margin-bottom: 2rem;
            }
          }
          
          @media (max-width: 767px) {
            .thumbnails {
              grid-template-columns: repeat(2, 1fr);
            }
            
            .features-grid {
              grid-template-columns: 1fr;
            }
            
            .car-owner {
              flex-direction: column;
              text-align: center;
            }
            
            .owner-avatar {
              width: 80px;
              height: 80px;
            }
          }
        `}</style>

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-8 text-sm">
              <button onClick={() => navigate("/cars")} className="text-gray-500 hover:text-gray-900 transition-colors">
                Browse Cars
              </button>
              <span className="text-gray-300">/</span>
              <span className="text-gray-700 font-medium">
                {car.year} {car.make} {car.model}
              </span>
            </div>

            <div className="car-detail-grid">
              <div className="car-detail-left">
                {/* Gallery Section */}
                <div className="car-gallery">
                  <div className="main-image">
                    <div className="gallery-badge">
                      <StatusBadge status={car.status} />
                    </div>
                    {images.length > 0 ? (
                      <img
                        src={images[selectedImageIndex] || "/placeholder.svg?height=450&width=800"}
                        alt={`${car.make} ${car.model}`}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {hasMultipleImages && (
                    <div className="thumbnails">
                      {images.slice(0, 4).map((image, index) => (
                        <div
                          key={index}
                          className={`thumbnail ${selectedImageIndex === index ? "active" : ""}`}
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          <img src={image || "/placeholder.svg"} alt={`${car.make} ${car.model} ${index + 1}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Car Info */}
                <div className="car-info">
                  <h1 className="car-name">
                    {car.year} {car.make} {car.model}
                  </h1>
                  <p className="car-subtitle">
                    {car.category} - {car.color}
                  </p>

                  <div className="rating-location">
                    <div className="location">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>{car.pickup_location}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="feature-section">
                    <h3 className="section-title">Car Features</h3>
                    <div className="features-grid">
                      <div className="feature-item">
                        <div className="feature-icon">
                          {/* Calendar icon for Model Year */}
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                        </div>
                        <div className="feature-text">
                          <span className="feature-label">Model Year</span>
                          <span className="feature-value">{car.year}</span>
                        </div>
                      </div>

                      <div className="feature-item">
                        <div className="feature-icon">
                          {/* Tag icon for Category */}
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"></path>
                            <line x1="7" y1="7" x2="7.01" y2="7"></line>
                          </svg>
                        </div>
                        <div className="feature-text">
                          <span className="feature-label">Category</span>
                          <span className="feature-value">{car.category}</span>
                        </div>
                      </div>

                      <div className="feature-item">
                        <div className="feature-icon">
                          {/* Palette icon for Color */}
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="13.5" cy="6.5" r=".5"></circle>
                            <circle cx="17.5" cy="10.5" r=".5"></circle>
                            <circle cx="8.5" cy="7.5" r=".5"></circle>
                            <circle cx="6.5" cy="12.5" r=".5"></circle>
                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>
                          </svg>
                        </div>
                        <div className="feature-text">
                          <span className="feature-label">Color</span>
                          <span className="feature-value">{car.color}</span>
                        </div>
                      </div>

                      <div className="feature-item">
                        <div className="feature-icon">
                          {/* Credit Card icon for License Plate */}
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                            <line x1="1" y1="10" x2="23" y2="10"></line>
                          </svg>
                        </div>
                        <div className="feature-text">
                          <span className="feature-label">License Plate</span>
                          <span className="feature-value">{car.license_plate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {car.description && (
                    <div className="description">
                      <h3 className="section-title">Description</h3>
                      <p>{car.description}</p>
                    </div>
                  )}

                  {/* Owner */}
                  {car.owner && (
                    <div className="car-owner">
                      <div className="owner-avatar">{car.owner.first_name?.charAt(0).toUpperCase() || "O"}</div>
                      <div className="owner-details">
                        <h3 className="owner-name">{car.owner.full_name}</h3>
                        <p className="owner-since">Car Host since 2023</p>
                        <div className="rating">
                          <div className="rating-stars">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                              </svg>
                            ))}
                          </div>
                          <span>5.0 (73 reviews)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Card */}
              <div className="car-detail-right">
                {car.status === "available" && (
                  <div className="booking-card">
                    <div className="booking-header">
                      <div className="booking-price">
                        ${car.daily_rate}
                        <span className="price-period">/day</span>
                      </div>
                    </div>

                    <form onSubmit={handleBooking} className="booking-form">
                      <div className="form-group">
                        <label className="form-label">When do you need this car?</label>
                        <div className="date-inputs">
                          <input
                            type="date"
                            className="date-input"
                            required
                            min={new Date().toISOString().split("T")[0]}
                            value={bookingData.start_date}
                            onChange={(e) =>
                              setBookingData({
                                ...bookingData,
                                start_date: e.target.value,
                              })
                            }
                          />
                          <input
                            type="date"
                            className="date-input"
                            required
                            min={bookingData.start_date || new Date().toISOString().split("T")[0]}
                            value={bookingData.end_date}
                            onChange={(e) =>
                              setBookingData({
                                ...bookingData,
                                end_date: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      {calculateDays() > 0 && (
                        <div className="booking-summary">
                          <div className="summary-item">
                            <span>
                              ${car.daily_rate} x {calculateDays()} days
                            </span>
                            <span>${totalPrice.toFixed(2)}</span>
                          </div>
                          <div className="summary-item">
                            <span>Service fee</span>
                            <span>${serviceFee.toFixed(2)}</span>
                          </div>
                          <div className="summary-item">
                            <span>Insurance</span>
                            <span>${insurance.toFixed(2)}</span>
                          </div>
                          <div className="summary-item total">
                            <span>Total</span>
                            <span>${finalTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      )}

                      <button type="submit" disabled={bookingLoading || !user} className="book-now-btn">
                        {bookingLoading ? <LoadingSpinner size="sm" /> : !user ? "Sign in to Book" : "Book Now"}
                      </button>

                      <p className="booking-note">You won't be charged yet</p>
                    </form>
                  </div>
                )}

                {car.status !== "available" && (
                  <div className="booking-card">
                    <div className="booking-form">
                      <div className="text-center py-8">
                        <p className="text-gray-500">This car is currently not available for booking.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}

export default CarDetails
