import { useState, useEffect } from "react"
import { bookingsAPI } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import LoadingSpinner from "../components/LoadingSpinner"

const Dashboard = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await bookingsAPI.getBookings()
      setBookings(response.data.bookings)
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return
    }

    setCancelling(bookingId)
    try {
      await bookingsAPI.cancelBooking(bookingId)
      fetchBookings() // Refresh the list
    } catch (error) {
      console.error("Error cancelling booking:", error)
      alert("Failed to cancel booking")
    } finally {
      setCancelling(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "confirmed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <i className="fas fa-clock text-amber-500"></i>
      case "confirmed":
        return <i className="fas fa-check-circle text-emerald-500"></i>
      case "completed":
        return <i className="fas fa-flag-checkered text-blue-500"></i>
      case "cancelled":
        return <i className="fas fa-times-circle text-red-500"></i>
      default:
        return <i className="fas fa-circle text-gray-500"></i>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const activeBookings = bookings.filter((b) => ["pending", "confirmed"].includes(b.status))
  const completedBookings = bookings.filter((b) => b.status === "completed")
  const totalSpent = completedBookings.reduce((sum, booking) => sum + Number.parseFloat(booking.total_price), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back, {user?.first_name}</h1>
              <p className="text-gray-600 mt-2">Manage your rentals and explore new rides</p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {user?.first_name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Active Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{activeBookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-car text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Trips</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{bookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-route text-emerald-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">${totalSpent.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-dollar-sign text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                <p className="text-gray-900 font-medium">{user?.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</p>
                <p className="text-gray-900 font-medium">{user?.phone_number || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">License</p>
                <p className="text-gray-900 font-medium">{user?.driver_license_number || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Account Type</p>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Your Bookings</h2>
              {bookings.length > 0 && (
                <span className="text-sm text-gray-500 font-medium">
                  {bookings.length} total booking{bookings.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-car text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Ready to hit the road? Browse our collection of amazing cars and book your first ride.
              </p>
              <a
                href="/cars"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <i className="fas fa-search text-sm"></i>
                Browse Cars
              </a>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {bookings.map((booking) => (
                <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {/* Car Image Placeholder */}
                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-car text-gray-400 text-xl"></i>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {booking.car.year} {booking.car.make} {booking.car.model}
                              </h3>
                              <p className="text-sm text-gray-500 mb-2">{booking.car.license_plate}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <i className="fas fa-calendar text-xs"></i>
                                  {new Date(booking.start_date).toLocaleDateString()} -{" "}
                                  {new Date(booking.end_date).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <i className="fas fa-clock text-xs"></i>
                                  {booking.duration_in_days} day{booking.duration_in_days !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900 mb-1">
                                ${Number.parseFloat(booking.total_price).toFixed(2)}
                              </p>
                              <div
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}
                              >
                                {getStatusIcon(booking.status)}
                                <span className="capitalize">{booking.status}</span>
                              </div>
                            </div>
                          </div>

                          {booking.status === "pending" && (
                            <div className="flex items-center gap-3 mt-4">
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                disabled={cancelling === booking.id}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                              >
                                {cancelling === booking.id ? (
                                  <>
                                    <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin"></div>
                                    Cancelling...
                                  </>
                                ) : (
                                  <>
                                    <i className="fas fa-times text-xs"></i>
                                    Cancel Booking
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
