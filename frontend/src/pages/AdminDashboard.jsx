import { useState, useEffect } from "react"
import { carsAPI, bookingsAPI, usersAPI } from "../services/api"
import LoadingSpinner from "../components/LoadingSpinner"

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [cars, setCars] = useState([])
  const [bookings, setBookings] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [carsRes, bookingsRes, usersRes] = await Promise.all([
        carsAPI.getCars(),
        bookingsAPI.getBookings(),
        usersAPI.getUsers(),
      ])

      setCars(carsRes.data.cars)
      setBookings(bookingsRes.data.bookings)
      setUsers(usersRes.data.users)

      // Calculate comprehensive stats
      const totalRevenue = bookingsRes.data.bookings
        .filter((b) => b.status === "completed")
        .reduce((sum, booking) => sum + Number.parseFloat(booking.total_price), 0)

      const monthlyRevenue = bookingsRes.data.bookings
        .filter((b) => {
          const bookingDate = new Date(b.created_at)
          const currentMonth = new Date().getMonth()
          const currentYear = new Date().getFullYear()
          return (
            b.status === "completed" &&
            bookingDate.getMonth() === currentMonth &&
            bookingDate.getFullYear() === currentYear
          )
        })
        .reduce((sum, booking) => sum + Number.parseFloat(booking.total_price), 0)

      setStats({
        totalCars: carsRes.data.cars.length,
        totalBookings: bookingsRes.data.bookings.length,
        totalUsers: usersRes.data.users.length,
        totalRevenue: totalRevenue,
        monthlyRevenue: monthlyRevenue,
        pendingBookings: bookingsRes.data.bookings.filter((b) => b.status === "pending").length,
        availableCars: carsRes.data.cars.filter((c) => c.status === "available").length,
        activeUsers: usersRes.data.users.filter((u) => u.role !== "admin").length,
        completedBookings: bookingsRes.data.bookings.filter((b) => b.status === "completed").length,
      })
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId, status) => {
    setActionLoading({ ...actionLoading, [`booking-${bookingId}`]: true })
    try {
      await bookingsAPI.updateBookingStatus(bookingId, status)
      fetchData()
    } catch (error) {
      console.error("Error updating booking status:", error)
      alert("Failed to update booking status")
    } finally {
      setActionLoading({ ...actionLoading, [`booking-${bookingId}`]: false })
    }
  }

  const updateCarStatus = async (carId, status) => {
    setActionLoading({ ...actionLoading, [`car-${carId}`]: true })
    try {
      await carsAPI.updateCarStatus(carId, status)
      fetchData()
    } catch (error) {
      console.error("Error updating car status:", error)
      alert("Failed to update car status")
    } finally {
      setActionLoading({ ...actionLoading, [`car-${carId}`]: false })
    }
  }

  const getStatusColor = (status, type = "booking") => {
    const statusColors = {
      booking: {
        pending: "bg-amber-50 text-amber-700 border-amber-200",
        confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
        completed: "bg-blue-50 text-blue-700 border-blue-200",
        cancelled: "bg-red-50 text-red-700 border-red-200",
      },
      car: {
        available: "bg-emerald-50 text-emerald-700 border-emerald-200",
        booked: "bg-red-50 text-red-700 border-red-200",
        maintenance: "bg-amber-50 text-amber-700 border-amber-200",
      },
      user: {
        admin: "bg-purple-50 text-purple-700 border-purple-200",
        host: "bg-blue-50 text-blue-700 border-blue-200",
        renter: "bg-gray-50 text-gray-700 border-gray-200",
      },
    }
    return statusColors[type]?.[status] || "bg-gray-50 text-gray-700 border-gray-200"
  }

  const getStatusIcon = (status, type = "booking") => {
    const icons = {
      booking: {
        pending: "fas fa-clock text-amber-500",
        confirmed: "fas fa-check-circle text-emerald-500",
        completed: "fas fa-flag-checkered text-blue-500",
        cancelled: "fas fa-times-circle text-red-500",
      },
      car: {
        available: "fas fa-check-circle text-emerald-500",
        booked: "fas fa-car text-red-500",
        maintenance: "fas fa-wrench text-amber-500",
      },
    }
    return icons[type]?.[status] || "fas fa-circle text-gray-500"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-gray-500">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: "fas fa-chart-line" },
    { id: "bookings", label: "Bookings", icon: "fas fa-calendar-alt", count: stats.pendingBookings },
    { id: "cars", label: "Cars", icon: "fas fa-car", count: cars.length },
    { id: "users", label: "Users", icon: "fas fa-users", count: users.length },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your car sharing platform</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                <i className="fas fa-crown text-sm"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? "border-black text-black bg-gray-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <i className={`${tab.icon} text-sm`}></i>
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-black rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">${stats.totalRevenue?.toFixed(2)}</p>
                    <p className="text-sm text-emerald-600 font-medium mt-1">
                      +${stats.monthlyRevenue?.toFixed(2)} this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <i className="fas fa-dollar-sign text-emerald-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Bookings</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalBookings}</p>
                    <p className="text-sm text-amber-600 font-medium mt-1">{stats.pendingBookings} pending</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <i className="fas fa-calendar-alt text-blue-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Fleet Status</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCars}</p>
                    <p className="text-sm text-emerald-600 font-medium mt-1">{stats.availableCars} available</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <i className="fas fa-car text-purple-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Active Users</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeUsers}</p>
                    <p className="text-sm text-gray-600 font-medium mt-1">{stats.totalUsers} total</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <i className="fas fa-users text-indigo-600 text-xl"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-600">
                              {booking.user.first_name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{booking.user.full_name}</p>
                            <p className="text-sm text-gray-500">
                              {booking.car.make} {booking.car.model}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status, "booking")}`}
                          >
                            <i className={`${getStatusIcon(booking.status, "booking")} text-xs`}></i>
                            <span className="capitalize">{booking.status}</span>
                          </span>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            ${Number.parseFloat(booking.total_price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">System Overview</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Completed Bookings:</span>
                      <span className="font-semibold text-gray-900">{stats.completedBookings}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Cars in Maintenance:</span>
                      <span className="font-semibold text-gray-900">
                        {cars.filter((c) => c.status === "maintenance").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Host Accounts:</span>
                      <span className="font-semibold text-gray-900">
                        {users.filter((u) => u.role === "host").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Renter Accounts:</span>
                      <span className="font-semibold text-gray-900">
                        {users.filter((u) => u.role === "renter").length}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium">Platform Health:</span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                          <i className="fas fa-check-circle text-xs"></i>
                          Excellent
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Manage Bookings</h2>
                <span className="text-sm text-gray-500 font-medium">
                  {bookings.length} total booking{bookings.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Car
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-600">
                              {booking.user.first_name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{booking.user.full_name}</div>
                            <div className="text-sm text-gray-500">{booking.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">
                          {booking.car.year} {booking.car.make} {booking.car.model}
                        </div>
                        <div className="text-sm text-gray-500">{booking.car.license_plate}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{new Date(booking.start_date).toLocaleDateString()}</div>
                        <div className="text-gray-500">to {new Date(booking.end_date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${Number.parseFloat(booking.total_price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status, "booking")}`}
                        >
                          <i className={`${getStatusIcon(booking.status, "booking")} text-xs`}></i>
                          <span className="capitalize">{booking.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={booking.status}
                          onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                          disabled={actionLoading[`booking-${booking.id}`]}
                          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cars Tab */}
        {activeTab === "cars" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Manage Cars</h2>
                <span className="text-sm text-gray-500 font-medium">
                  {cars.length} total car{cars.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Car
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Daily Rate
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cars.map((car) => (
                    <tr key={car.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <i className="fas fa-car text-gray-400"></i>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {car.year} {car.make} {car.model}
                            </div>
                            <div className="text-sm text-gray-500">{car.license_plate}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 font-medium">{car.owner?.full_name || "N/A"}</div>
                        <div className="text-sm text-gray-500">{car.owner?.email || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {car.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">${car.daily_rate}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(car.status, "car")}`}
                        >
                          <i className={`${getStatusIcon(car.status, "car")} text-xs`}></i>
                          <span className="capitalize">{car.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={car.status}
                          onChange={(e) => updateCarStatus(car.id, e.target.value)}
                          disabled={actionLoading[`car-${car.id}`]}
                          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="available">Available</option>
                          <option value="booked">Booked</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Manage Users</h2>
                <span className="text-sm text-gray-500 font-medium">
                  {users.length} total user{users.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-600">
                              {user.first_name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.full_name}</div>
                            <div className="text-sm text-gray-500">{user.driver_license_number}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.phone_number}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.role, "user")}`}
                        >
                          <span className="capitalize">{user.role}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                          <span className="text-sm text-gray-600">Active</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
