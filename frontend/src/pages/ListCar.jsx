import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { carsAPI } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import LoadingSpinner from "../components/LoadingSpinner"

const ListCar = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    license_plate: "",
    daily_rate: "",
    description: "",
    category: "economy",
    pickup_location: "",
    available_from: "",
    available_to: "",
  })

  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [stepErrors, setStepErrors] = useState({})
  const [dragActive, setDragActive] = useState(false)

  const categories = [
    { value: "economy", label: "Economy", icon: "fas fa-car" },
    { value: "compact", label: "Compact", icon: "fas fa-car-side" },
    { value: "luxury", label: "Luxury", icon: "fas fa-gem" },
    { value: "SUV", label: "SUV", icon: "fas fa-truck" },
    { value: "truck", label: "Truck", icon: "fas fa-truck-pickup" },
    { value: "convertible", label: "Convertible", icon: "fas fa-car-burst" },
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1980 + 2 }, (_, i) => currentYear + 1 - i)

  const steps = [
    { number: 1, title: "Car Details", description: "Basic information about your car", icon: "fas fa-car" },
    {
      number: 2,
      title: "Pricing & Location",
      description: "Set your rate and pickup location",
      icon: "fas fa-dollar-sign",
    },
    { number: 3, title: "Description", description: "Describe your car and features", icon: "fas fa-edit" },
    { number: 4, title: "Photos", description: "Upload photos of your car", icon: "fas fa-camera" },
    { number: 5, title: "Review & Submit", description: "Review and publish your listing", icon: "fas fa-check" },
  ]

  const showAlert = (message, type = "info") => {
    const modal = document.createElement("div")
    modal.className = "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
    modal.innerHTML = `
      <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-100 animate-scale-in">
        <div class="flex items-center mb-6">
          ${
            type === "success"
              ? '<div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4"><i class="fas fa-check text-green-600 text-xl"></i></div>'
              : '<div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4"><i class="fas fa-info text-gray-600 text-xl"></i></div>'
          }
          <h3 class="text-xl font-semibold text-gray-900">
            ${type === "success" ? "Success!" : "Information"}
          </h3>
        </div>
        <p class="text-gray-600 mb-6 leading-relaxed">${message}</p>
        <button class="w-full bg-black text-white py-3 px-6 rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium ok-btn">Got it</button>
      </div>
    `
    modal.querySelector(".ok-btn").onclick = () => {
      modal.classList.add("animate-fade-out")
      setTimeout(() => modal.remove(), 200)
    }
    document.body.appendChild(modal)
  }

  const validateStep = (step) => {
    const errors = {}

    switch (step) {
      case 1:
        if (!formData.make.trim()) errors.make = "Make is required"
        if (!formData.model.trim()) errors.model = "Model is required"
        if (!formData.year) errors.year = "Year is required"
        if (!formData.license_plate.trim()) errors.license_plate = "License plate is required"
        if (!formData.category) errors.category = "Category is required"
        break
      case 2:
        if (!formData.daily_rate || formData.daily_rate <= 0) errors.daily_rate = "Daily rate must be greater than 0"
        if (!formData.pickup_location.trim()) errors.pickup_location = "Pickup location is required"
        if (formData.available_from && formData.available_to && formData.available_to < formData.available_from) {
          errors.available_to = "End date must be after start date"
        }
        break
      case 3:
        break
      case 4:
        break
      case 5:
        const step1Errors = validateStep(1)
        const step2Errors = validateStep(2)
        Object.assign(errors, step1Errors, step2Errors)
        break
    }

    return errors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (stepErrors[name]) {
      setStepErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  // Drag and Drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFiles = (files) => {
    const fileArray = Array.from(files)

    if (fileArray.length + images.length > 10) {
      showAlert("You can upload a maximum of 10 images")
      return
    }

    const validFiles = []
    const previews = []

    fileArray.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        showAlert("Please select only image files")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        showAlert("Each image must be less than 5MB")
        return
      }

      validFiles.push(file)

      const reader = new FileReader()
      reader.onload = (event) => {
        previews.push({
          file: file,
          url: event.target.result,
          id: Math.random().toString(36).substr(2, 9),
        })

        if (previews.length === validFiles.length) {
          setImages((prev) => [...prev, ...validFiles])
          setImagePreviews((prev) => [...prev, ...previews])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleImageChange = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const reorderImages = (dragIndex, hoverIndex) => {
    const draggedImage = images[dragIndex]
    const draggedPreview = imagePreviews[dragIndex]

    const newImages = [...images]
    const newPreviews = [...imagePreviews]

    newImages.splice(dragIndex, 1)
    newImages.splice(hoverIndex, 0, draggedImage)

    newPreviews.splice(dragIndex, 1)
    newPreviews.splice(hoverIndex, 0, draggedPreview)

    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  const nextStep = () => {
    const errors = validateStep(currentStep)

    if (Object.keys(errors).length > 0) {
      setStepErrors(errors)
      return
    }

    setStepErrors({})
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    const errors = validateStep(5)

    if (Object.keys(errors).length > 0) {
      setStepErrors(errors)
      return
    }

    setErrors([])
    setSuccess("")
    setLoading(true)

    try {
      const formDataToSend = new FormData()

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== "") {
          formDataToSend.append(`car[${key}]`, formData[key])
        }
      })

      images.forEach((image, index) => {
        formDataToSend.append("images[]", image)
      })

      const response = await carsAPI.createCar(formDataToSend)

      setSuccess("Car listed successfully!")
      showAlert("Your car has been successfully listed and is now available for rental!", "success")

      setTimeout(() => {
        navigate("/dashboard")
      }, 2000)
    } catch (error) {
      const errorMessages = error.response?.data?.errors || [error.response?.data?.error || "Failed to list car"]
      setErrors(Array.isArray(errorMessages) ? errorMessages : [errorMessages])
      showAlert(`Error: ${errorMessages[0] || "Failed to list car"}`)
    } finally {
      setLoading(false)
    }
  }

  if (!user?.role || (user.role !== "host" && user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-lock text-gray-400 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            You need to be a host to list cars. Please contact support to upgrade your account.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-black text-white py-3 px-6 rounded-xl hover:bg-gray-800 transition-all duration-200 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const ProgressBar = () => (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={`relative flex items-center justify-center w-12 h-12 rounded-full text-sm font-semibold transition-all duration-300 ${
                currentStep >= step.number
                  ? "bg-black text-white shadow-lg scale-110"
                  : currentStep === step.number - 1
                    ? "bg-gray-200 text-gray-700 animate-pulse"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {currentStep > step.number ? (
                <i className="fas fa-check text-lg"></i>
              ) : (
                <i className={`${step.icon} text-sm`}></i>
              )}
              {currentStep === step.number && (
                <div className="absolute -inset-1 bg-black rounded-full animate-ping opacity-20"></div>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 sm:w-24 h-1 mx-3 rounded-full transition-all duration-500 ${
                  currentStep > step.number ? "bg-black" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{steps[currentStep - 1].title}</h2>
        <p className="text-gray-600">{steps[currentStep - 1].description}</p>
      </div>
    </div>
  )

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Make *</label>
                <input
                  type="text"
                  name="make"
                  required
                  value={formData.make}
                  onChange={handleChange}
                  placeholder="Toyota, BMW, Tesla"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 transition-all duration-200 text-base font-medium ${
                    stepErrors.make
                      ? "border-red-300 bg-red-50 focus:border-red-500"
                      : "border-gray-200 bg-white focus:border-black hover:border-gray-300"
                  }`}
                />
                {stepErrors.make && <p className="text-red-500 text-sm font-medium">{stepErrors.make}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Model *</label>
                <input
                  type="text"
                  name="model"
                  required
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="Camry, 3 Series, Model 3"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 transition-all duration-200 text-base font-medium ${
                    stepErrors.model
                      ? "border-red-300 bg-red-50 focus:border-red-500"
                      : "border-gray-200 bg-white focus:border-black hover:border-gray-300"
                  }`}
                />
                {stepErrors.model && <p className="text-red-500 text-sm font-medium">{stepErrors.model}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Year *</label>
                <select
                  name="year"
                  required
                  value={formData.year}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 transition-all duration-200 text-base font-medium bg-white ${
                    stepErrors.year
                      ? "border-red-300 bg-red-50 focus:border-red-500"
                      : "border-gray-200 focus:border-black hover:border-gray-300"
                  }`}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {stepErrors.year && <p className="text-red-500 text-sm font-medium">{stepErrors.year}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="White, Black, Silver"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-black hover:border-gray-300 transition-all duration-200 text-base font-medium bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">License Plate *</label>
                <input
                  type="text"
                  name="license_plate"
                  required
                  value={formData.license_plate}
                  onChange={handleChange}
                  placeholder="ABC-1234"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 transition-all duration-200 text-base font-medium ${
                    stepErrors.license_plate
                      ? "border-red-300 bg-red-50 focus:border-red-500"
                      : "border-gray-200 bg-white focus:border-black hover:border-gray-300"
                  }`}
                />
                {stepErrors.license_plate && (
                  <p className="text-red-500 text-sm font-medium">{stepErrors.license_plate}</p>
                )}
              </div>
            </div>

            {/* Added margin-top for spacing above Category label */}
            <div className="space-y-3 mt-8">
              <label className="block text-sm font-semibold text-gray-900">Category *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <label key={category.value} className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value={category.value}
                      checked={formData.category === category.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      className={`border-2 rounded-xl p-4 text-center transition-all duration-200 hover:scale-105 ${
                        formData.category === category.value
                          ? "border-black bg-black text-white shadow-lg"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="mb-2">
                        <i className={`${category.icon} text-xl`}></i>
                      </div>
                      <div className="font-semibold text-sm">{category.label}</div>
                    </div>
                  </label>
                ))}
              </div>
              {stepErrors.category && <p className="text-red-500 text-sm font-medium">{stepErrors.category}</p>}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            {/* Daily Rate - Full Width */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Daily Rate (USD) *</label>
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-lg font-semibold">$</span>
                </div>
                <input
                  type="number"
                  name="daily_rate"
                  required
                  min="1"
                  step="0.01"
                  value={formData.daily_rate}
                  onChange={handleChange}
                  placeholder="50.00"
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 transition-all duration-200 text-base font-medium ${
                    stepErrors.daily_rate
                      ? "border-red-300 bg-red-50 focus:border-red-500"
                      : "border-gray-200 bg-white focus:border-black hover:border-gray-300"
                  }`}
                />
              </div>
              {stepErrors.daily_rate && <p className="text-red-500 text-sm font-medium">{stepErrors.daily_rate}</p>}
            </div>

            {/* Location and Availability - Three columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Pickup Location *</label>
                <input
                  type="text"
                  name="pickup_location"
                  required
                  value={formData.pickup_location}
                  onChange={handleChange}
                  placeholder="Downtown Seattle, WA"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 transition-all duration-200 text-base font-medium ${
                    stepErrors.pickup_location
                      ? "border-red-300 bg-red-50 focus:border-red-500"
                      : "border-gray-200 bg-white focus:border-black hover:border-gray-300"
                  }`}
                />
                {stepErrors.pickup_location && (
                  <p className="text-red-500 text-sm font-medium">{stepErrors.pickup_location}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Available From</label>
                <input
                  type="date"
                  name="available_from"
                  value={formData.available_from}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-black hover:border-gray-300 transition-all duration-200 text-base font-medium bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Available Until</label>
                <input
                  type="date"
                  name="available_to"
                  value={formData.available_to}
                  onChange={handleChange}
                  min={formData.available_from || new Date().toISOString().split("T")[0]}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-0 transition-all duration-200 text-base font-medium bg-white ${
                    stepErrors.available_to
                      ? "border-red-300 bg-red-50 focus:border-red-500"
                      : "border-gray-200 focus:border-black hover:border-gray-300"
                  }`}
                />
                {stepErrors.available_to && (
                  <p className="text-red-500 text-sm font-medium">{stepErrors.available_to}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Car Description</label>
              <textarea
                name="description"
                rows={8}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your car's features, condition, and any special instructions for renters..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-black hover:border-gray-300 transition-all duration-200 text-base font-medium bg-white resize-none"
              />
              <p className="text-sm text-gray-500 leading-relaxed">
                Tell potential renters about your car's features, fuel efficiency, any recent maintenance, and pickup
                instructions.
              </p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-900">Upload Car Photos</label>

              {/* Drag and Drop Area */}
              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-black bg-gray-50 scale-105"
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="space-y-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <i className="fas fa-cloud-upload-alt text-gray-400 text-2xl"></i>
                  </div>

                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      {dragActive ? "Drop your images here" : "Drag & drop images here"}
                    </p>
                    <p className="text-gray-500 mb-4">or click to browse files</p>
                    <p className="text-sm text-gray-400">Maximum 10 images, 5MB each • JPG, PNG, WEBP</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Smaller horizontal preview images */}
            {imagePreviews.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Uploaded Images ({imagePreviews.length}/10)</h3>
                  <p className="text-sm text-gray-500">Drag to reorder</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={preview.id}
                      className="relative group cursor-move"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", index.toString())
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        const dragIndex = Number.parseInt(e.dataTransfer.getData("text/plain"))
                        reorderImages(dragIndex, index)
                      }}
                    >
                      <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-gray-300 transition-all duration-200">
                        <img
                          src={preview.url || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100 shadow-lg"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </button>

                      {index === 0 && (
                        <div className="absolute bottom-1 left-1 bg-black text-white text-xs px-1.5 py-0.5 rounded font-semibold">
                          Main
                        </div>
                      )}

                      <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl">
                <div className="flex items-start gap-3">
                  <i className="fas fa-exclamation-triangle text-red-500 mt-0.5"></i>
                  <div>
                    <h4 className="font-semibold mb-2">Please fix the following errors:</h4>
                    <ul className="space-y-1 text-sm">
                      {errors.map((error, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-1 h-1 bg-red-400 rounded-full mt-2 flex-shrink-0"></span>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <i className="fas fa-check-circle text-green-500"></i>
                  <span className="font-medium">{success}</span>
                </div>
              </div>
            )}

            {/* Modern Review Section */}
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center pb-6 border-b border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Review Your Listing</h3>
                <p className="text-gray-500">Make sure everything looks perfect before publishing</p>
              </div>

              {/* Car Overview - Hero Card */}
              <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-100 p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-3xl font-bold text-gray-900 mb-2">
                        {formData.year} {formData.make} {formData.model}
                      </h4>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-gray-200">
                          <i className="fas fa-tag text-xs"></i>
                          {formData.category}
                        </span>
                        {formData.color && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-gray-200">
                            <i className="fas fa-palette text-xs"></i>
                            {formData.color}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-gray-200">
                          <i className="fas fa-id-card text-xs"></i>
                          {formData.license_plate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center lg:text-right">
                    <div className="inline-flex items-baseline gap-1 px-6 py-3 bg-black text-white rounded-2xl">
                      <span className="text-3xl font-bold">${formData.daily_rate}</span>
                      <span className="text-sm opacity-80">/day</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid - Minimal Cards */}
              <div className="grid gap-4">
                {/* Location & Availability */}
                <div className="group hover:bg-gray-50 transition-colors duration-200 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors duration-200">
                      <i className="fas fa-map-marker-alt text-gray-600 text-sm"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-gray-900 mb-3">Location & Availability</h5>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                            Pickup Location
                          </p>
                          <p className="text-gray-900 font-medium">{formData.pickup_location}</p>
                        </div>
                        {(formData.available_from || formData.available_to) && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                              Availability
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                              {formData.available_from && (
                                <span className="px-2 py-1 bg-gray-100 rounded-lg">
                                  From: {new Date(formData.available_from).toLocaleDateString()}
                                </span>
                              )}
                              {formData.available_to && (
                                <span className="px-2 py-1 bg-gray-100 rounded-lg">
                                  Until: {new Date(formData.available_to).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Photos */}
                <div className="group hover:bg-gray-50 transition-colors duration-200 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors duration-200">
                      <i className="fas fa-camera text-gray-600 text-sm"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold text-gray-900">Photos</h5>
                        <span className="text-sm text-gray-500 font-medium">{imagePreviews.length} images</span>
                      </div>
                      {imagePreviews.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {imagePreviews.slice(0, 6).map((preview, index) => (
                            <div key={index} className="relative group/img">
                              <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200 group-hover/img:border-gray-300 transition-colors duration-200">
                                <img
                                  src={preview.url || "/placeholder.svg"}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              {index === 0 && (
                                <div className="absolute -top-1 -right-1 bg-black text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                                  Main
                                </div>
                              )}
                            </div>
                          ))}
                          {imagePreviews.length > 6 && (
                            <div className="w-16 h-16 bg-gray-100 rounded-xl border-2 border-gray-200 flex items-center justify-center">
                              <span className="text-xs font-semibold text-gray-600">+{imagePreviews.length - 6}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500">
                          <i className="fas fa-image text-sm"></i>
                          <span className="text-sm">No photos uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {formData.description && (
                  <div className="group hover:bg-gray-50 transition-colors duration-200 rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors duration-200">
                        <i className="fas fa-file-alt text-gray-600 text-sm"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-gray-900 mb-3">Description</h5>
                        <p className="text-gray-700 leading-relaxed text-sm">{formData.description}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Publishing Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Ready to publish?</p>
                    <p>Your listing will be reviewed and made available to renters within 24 hours.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-fade-out {
          animation: fade-out 0.2s ease-in;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200 group"
            >
              <i className="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform duration-200"></i>
              Back to Dashboard
            </button>

            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">List Your Car</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Share your car with the community and start earning money
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 lg:p-12">
              <ProgressBar />

              <div className="mb-12">{renderStep()}</div>

              {/* Navigation Buttons with proper spacing */}
              <div className="flex justify-between items-center pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold disabled:hover:bg-white disabled:hover:border-gray-300"
                >
                  Previous
                </button>

                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>

                  {currentStep < totalSteps ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-semibold hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      Next Step
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold hover:scale-105 shadow-lg hover:shadow-xl flex items-center disabled:hover:scale-100"
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">Publishing...</span>
                        </>
                      ) : (
                        "Publish Listing"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ListCar
