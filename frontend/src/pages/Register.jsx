import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const Register = () => {
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password_confirmation: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    driver_license_number: "",
    role: searchParams.get("role") || "renter",
  })
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])
    setLoading(true)

    const result = await register(formData)

    if (result.success) {
      navigate("/dashboard")
    } else {
      setErrors(Array.isArray(result.error) ? result.error : [result.error])
    }

    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <Link to="/login" className="font-medium text-gray-900 hover:text-gray-700 underline">
              sign in to existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              <div className="flex items-start gap-3">
                <i className="fas fa-exclamation-triangle text-red-500 mt-0.5 flex-shrink-0"></i>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Please fix the following errors:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="relative">
                  <input
                    type="radio"
                    name="role"
                    value="renter"
                    checked={formData.role === "renter"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div
                    className={`border-2 rounded-md p-4 cursor-pointer transition-colors ${
                      formData.role === "renter" ? "border-black bg-gray-50" : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-medium text-gray-900">Rent Cars</div>
                      <div className="text-sm text-gray-600 mt-1">Find and book cars</div>
                    </div>
                  </div>
                </label>

                <label className="relative">
                  <input
                    type="radio"
                    name="role"
                    value="host"
                    checked={formData.role === "host"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div
                    className={`border-2 rounded-md p-4 cursor-pointer transition-colors ${
                      formData.role === "host" ? "border-black bg-gray-50" : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-medium text-gray-900">Share Cars</div>
                      <div className="text-sm text-gray-600 mt-1">List and earn money</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-900 mb-2">
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-900 mb-2">
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-900 mb-2">
                Phone Number
              </label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base"
                value={formData.phone_number}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="driver_license_number" className="block text-sm font-medium text-gray-900 mb-2">
                Driver License Number
              </label>
              <input
                id="driver_license_number"
                name="driver_license_number"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base"
                value={formData.driver_license_number}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-900 mb-2">
                Confirm Password
              </label>
              <input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-base"
                value={formData.password_confirmation}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black transition-colors duration-200"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
