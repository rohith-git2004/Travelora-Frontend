function Footer() {
  return (
    <footer
      id="contact"
      className="bg-gradient-to-b from-blue-50 via-white to-sky-50 border-t border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">✈️</span>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-sky-500 bg-clip-text text-transparent">
              Travelora
            </h2>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed max-w-sm">
            Discover curated destinations, trusted travel packages, and smooth
            booking experiences with Travelora. Travel better, smarter, and with
            confidence.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a href="/" className="text-gray-600 hover:text-blue-500 transition">
                Home
              </a>
            </li>
            <li>
              <a
                href="#featured-packages"
                className="text-gray-600 hover:text-blue-500 transition"
              >
                Packages
              </a>
            </li>
            <li>
              <a
                href="/login"
                className="text-gray-600 hover:text-blue-500 transition"
              >
                Login
              </a>
            </li>
            <li>
              <a
                href="/register"
                className="text-gray-600 hover:text-blue-500 transition"
              >
                Register
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Contact</h3>
          <ul className="space-y-3 text-gray-600 text-sm">
            <li className="flex items-center gap-3">
              <span>📧</span>
              <span>support@travelora.com</span>
            </li>
            <li className="flex items-center gap-3">
              <span>📞</span>
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center gap-3">
              <span>📍</span>
              <span>Kerala, India</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm border-t border-gray-200 py-4">
        <p>© {new Date().getFullYear()} Travelora. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer