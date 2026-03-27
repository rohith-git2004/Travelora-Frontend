import { Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import serverURL from "../../services/serverURL"

function WishList() {
  const [wishlist, setWishlist] = useState([])
  const navigate = useNavigate()

  // ✅ Page-enter animation only (runs once)
  const [pageEnter, setPageEnter] = useState(false)

  useEffect(() => {
    setPageEnter(true)
    const saved = JSON.parse(localStorage.getItem("wishlist")) || []
    setWishlist(saved)
  }, [])

  const removeFromWishlist = (id) => {
    const updated = wishlist.filter((item) => item._id !== id)
    setWishlist(updated)
    localStorage.setItem("wishlist", JSON.stringify(updated))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-sky-50">
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* ✅ page enter wrapper */}
        <div className={`${pageEnter ? "page-enter" : ""}`}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                My Wishlist{" "}
                <span className="bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  ❤️
                </span>
              </h1>
              <p className="text-gray-500 mt-2 max-w-2xl">
                Packages you liked and saved. You can book them anytime.
              </p>
            </div>

            <button
              onClick={() => navigate("/user/packages")}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white font-semibold hover:brightness-110 transition hover:scale-[1.01] active:scale-[0.99]"
            >
              Explore Packages
            </button>
          </div>

          {/* Empty State */}
          {wishlist.length === 0 ? (
            <div className="rounded-2xl bg-white/60 border border-white/60 backdrop-blur-xl shadow-sm shadow-black/10 p-10 text-center">
              <div className="text-5xl mb-4">💔</div>
              <h2 className="text-xl font-semibold text-gray-900">
                Your wishlist is empty
              </h2>
              <p className="text-gray-600 mt-2 mb-6">
                Like some packages and they will appear here.
              </p>
              <button
                onClick={() => navigate("/user/packages")}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white font-semibold hover:brightness-110 transition hover:scale-[1.01] active:scale-[0.99]"
              >
                Browse Packages
              </button>
            </div>
          ) : (
            /* Wishlist Cards */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {wishlist.map((pkg) => (
                <div
                  key={pkg._id}
                  onClick={() => navigate(`/user/packages/${pkg._id}`)}
                  className="group bg-white border border-gray-200 rounded-2xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden relative cursor-pointer"
                >
                  {/* WISHLIST remove */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFromWishlist(pkg._id)
                    }}
                    className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow hover:scale-110 transition"
                    title="Remove"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>

                  {/* Image */}
                  {pkg.image ? (
                    <img
                      src={`${serverURL}/uploads/${pkg.image}`}
                      alt={pkg.title}
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-52 bg-gray-100 flex items-center justify-center text-5xl">
                      🧳
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {pkg.title}
                    </h3>

                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                      {pkg.description}
                    </p>

                    <div className="flex justify-between items-center mt-4">
                      <span className="text-2xl font-bold text-blue-600">
                        ₹{Number(pkg.price || 0).toLocaleString()}
                      </span>

                      <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">
                        Wishlisted
                      </span>
                    </div>

                    {/* Booking option */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/user/packages/${pkg._id}`)
                      }}
                      className="mt-5 w-full py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white font-semibold hover:brightness-110 transition"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ✅ Page-enter animation styles (only once) */}
      <style>{`
        .page-enter {
          animation: pageEnter 0.45s ease-out both;
        }
        @keyframes pageEnter {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default WishList