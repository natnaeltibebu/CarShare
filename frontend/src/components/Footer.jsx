const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center space-y-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">

            <span className="text-lg font-semibold text-gray-900">CarShare</span>
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-500">© {currentYear} CarShare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
