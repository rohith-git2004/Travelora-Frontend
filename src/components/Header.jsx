import { Link, useNavigate, useLocation } from "react-router-dom"
import { useContext, useEffect, useMemo, useState } from "react"
import { AuthContext } from "../context/AuthContext"
import serverURL from "../services/serverURL"
import { Menu, X } from "lucide-react"

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { role, logout, user } = useContext(AuthContext)

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const featuredOffers = [
    { title: "Goa Special", discount: "30% OFF" },
    { title: "Manali Trek", discount: "25% OFF" },
    { title: "Kerala Escape", discount: "20% OFF" },
    { title: "Rajasthan Heritage", discount: "35% OFF" },
  ]

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".dropdown-container")) {
        setIsDropdownOpen(false)
      }
      if (isMobileMenuOpen && !event.target.closest(".mobilemenu-container")) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isDropdownOpen, isMobileMenuOpen])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsDropdownOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
  logout()

  // force clear + redirect
  localStorage.removeItem("user")
  localStorage.removeItem("role")

  window.location.href = "/"
}

  const effectiveUser = useMemo(() => {
    if (user) return user
    try {
      return JSON.parse(localStorage.getItem("user") || "null")
    } catch {
      return null
    }
  }, [user])

  const profileImage = effectiveUser?.profileImage || ""
  const profileSrc = profileImage ? `${serverURL}/uploads/${profileImage}` : ""

  const getUserInitial = () => {
    return (
      effectiveUser?.name?.charAt(0).toUpperCase() ||
      role?.charAt(0).toUpperCase() ||
      "U"
    )
  }

  const navLinks = useMemo(() => {
    if (role === "user") {
      return [
        { label: "Home", to: "/user/packages" },
        { label: "Dashboard", to: "/user/dashboard" },
        { label: "Bookings", to: "/user/bookings" },
        { label: "History", to: "/user/history" },
        { label: "Wishlist", to: "/user/saved" },
      ]
    }

    if (role === "agent") {
      return [
        { label: "Dashboard", to: "/agent/dashboard" },
        { label: "Packages", to: "/agent/packages" },
        { label: "Create Package", to: "/agent/create" },
      ]
    }

    if (role === "admin") {
      return [
        { label: "Dashboard", to: "/admin/dashboard" },
        { label: "Accounts", to: "/admin/users" },
        { label: "Create Agent", to: "/admin/create-agent" },
        { label: "Packages", to: "/admin/packages" },
        { label: "History", to: "/admin/bookings" },
      ]
    }

    return []
  }, [role])

  const publicLinks = [
    { label: "Home", to: "/" },
    { label: "Packages", to: "#featured-packages" },
    { label: "Why Travelora", to: "#why-travelora" },
    { label: "Contact", to: "#contact" },
  ]

  const filteredNavLinks = navLinks.filter((link) => link.to !== location.pathname)

  const getProfilePath = () => {
    if (role === "user") return "/user/profile"
    if (role === "admin") return "/admin/profile"
    if (role === "agent") return "/agent/profile"
    return "/"
  }

  return (
    <header className="sticky top-0 z-50">
      {role && (
        <div className="bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 text-white py-2 overflow-hidden">
          <div className="animate-scroll-slow flex gap-8 whitespace-nowrap">
            {[...featuredOffers, ...featuredOffers].map((offer, index) => (
              <div key={index} className="inline-flex items-center gap-2 px-4">
                <span className="text-yellow-200">★</span>
                <span className="font-semibold">{offer.title}</span>
                <span className="bg-white text-blue-600 px-2 py-1 rounded-full text-xs font-bold">
                  {offer.discount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className={`transition-all duration-300 ${
          isScrolled
            ? "bg-white/75 backdrop-blur-xl border-b border-white/40 shadow-sm"
            : "bg-white/40 backdrop-blur-md border-b border-white/20"
        }`}
      >
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 transition-all duration-300 ${
            isScrolled ? "py-3" : "py-4"
          }`}
        >
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold">
              <Link
                to={role ? `/${role}/dashboard` : "/"}
                className="flex items-center gap-2"
              >
                <span className="drop-shadow-sm">✈️</span>
                <span className="bg-gradient-to-r from-blue-500 to-sky-500 bg-clip-text text-transparent">
                  Travelora
                </span>
              </Link>
            </h1>

            <nav className="flex items-center gap-3">
              {role ? (
                <>
                  <div className="hidden sm:flex items-center gap-2">
                    {filteredNavLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="px-4 py-2 rounded-xl text-gray-700 hover:bg-white/60 transition"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  <div className="sm:hidden mobilemenu-container relative">
                    <button
                      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/60 border border-white/40 text-gray-700"
                    >
                      {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>

                    {isMobileMenuOpen && (
                      <div className="absolute right-0 top-12 w-56 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/50 shadow-xl overflow-hidden">
                        {filteredNavLinks.map((link) => (
                          <Link
                            key={link.to}
                            to={link.to}
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition"
                          >
                            {link.label}
                          </Link>
                        ))}

                        <Link
                          to={getProfilePath()}
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition"
                        >
                          Profile
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="relative dropdown-container flex items-center">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="relative w-10 h-10 rounded-full border border-white/40 shadow-sm"
                    >
                      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-blue-500 to-sky-500 text-white">
                        {profileSrc ? (
                          <img
                            src={profileSrc}
                            alt="profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-semibold">{getUserInitial()}</span>
                        )}
                      </div>

                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></span>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 top-12 w-52 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/50 shadow-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="text-sm font-medium text-gray-800 truncate">
                            {effectiveUser?.name || "User"}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {effectiveUser?.email || ""}
                          </div>
                        </div>

                        <Link
                          to={getProfilePath()}
                          onClick={() => setIsDropdownOpen(false)}
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition"
                        >
                          Edit Profile
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="hidden md:flex items-center gap-2">
                    {publicLinks.map((link) =>
                      link.to.startsWith("#") ? (
                        <a
                          key={link.to}
                          href={link.to}
                          className="px-4 py-2 rounded-xl text-gray-700 hover:bg-white/60 transition"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          key={link.to}
                          to={link.to}
                          className="px-4 py-2 rounded-xl text-gray-700 hover:bg-white/60 transition"
                        >
                          {link.label}
                        </Link>
                      )
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to="/login"
                      className="px-4 py-2 rounded-xl text-gray-700 hover:bg-white/60 transition"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 text-white font-medium hover:brightness-110 transition shadow-sm"
                    >
                      Register
                    </Link>
                  </div>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll-slow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .animate-scroll-slow {
          animation: scroll-slow 30s linear infinite;
        }
      `}</style>
    </header>
  )
}

export default Header