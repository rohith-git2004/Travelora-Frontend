import { useEffect, useMemo, useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { getAllPackagesAPI } from "../../services/userAPI"
import { AuthContext } from "../../context/AuthContext"
import serverURL from "../../services/serverURL"

function Packages() {
  const [packages, setPackages] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [travelType, setTravelType] = useState("")
  const [sortOption, setSortOption] = useState("")

  const [showFilter, setShowFilter] = useState(false)
  const [showSort, setShowSort] = useState(false)

  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  const travelTypes = [
    "Beach",
    "Hill Station",
    "Heritage",
    "Adventure",
    "Pilgrimage",
    "Honeymoon",
    "Family",
    "Weekend",
    "International",
    "Budget",
  ]

  useEffect(() => {
    fetchPackages()

    const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || []
    setWishlist(savedWishlist)
  }, [])

  useEffect(() => {
    const onMouseDown = (e) => {
      if (showFilter && !e.target.closest(".filter-container")) {
        setShowFilter(false)
      }
      if (showSort && !e.target.closest(".sort-container")) {
        setShowSort(false)
      }
    }

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowFilter(false)
        setShowSort(false)
      }
    }

    if (showFilter || showSort) {
      document.addEventListener("mousedown", onMouseDown)
      window.addEventListener("keydown", onKeyDown)
    }

    return () => {
      document.removeEventListener("mousedown", onMouseDown)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [showFilter, showSort])

  const fetchPackages = async () => {
    try {
      const res = await getAllPackagesAPI()
      if (res.status === 200) {
        setPackages(res.data)
      }
    } catch (error) {
      alert("Failed to load packages")
    } finally {
      setLoading(false)
    }
  }

  const toggleWishlist = (e, pkg) => {
    e.stopPropagation()

    let updatedWishlist

    if (wishlist.some((item) => item._id === pkg._id)) {
      updatedWishlist = wishlist.filter((item) => item._id !== pkg._id)
    } else {
      updatedWishlist = [...wishlist, pkg]
    }

    setWishlist(updatedWishlist)
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist))
  }

  const isWishlisted = (id) => wishlist.some((item) => item._id === id)

  const filteredPackages = useMemo(() => {
    const q = search.toLowerCase()

    let result = packages.filter((pkg) => {
      const matchSearch =
        pkg.title.toLowerCase().includes(q) ||
        pkg.destination?.toLowerCase().includes(q) ||
        pkg.description?.toLowerCase().includes(q)

      const matchType = !travelType || pkg.travelType === travelType

      return matchSearch && matchType
    })

    if (sortOption === "priceLow") {
      result = [...result].sort((a, b) => a.price - b.price)
    }

    if (sortOption === "priceHigh") {
      result = [...result].sort((a, b) => b.price - a.price)
    }

    return result
  }, [packages, search, travelType, sortOption])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-sky-50">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            Welcome{user?.name ? `, ${user.name}` : ""}
          </h1>

          <p className="mt-2 text-gray-500 max-w-2xl">
            Explore travel packages and discover amazing destinations.
          </p>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder=" ⌕ Search packages or destinations..."
            className="flex-1 bg-white/30 backdrop-blur-md border border-white/40 rounded-2xl px-4 py-2 outline-none shadow-md placeholder:text-gray-500"
          />

          <div className="relative filter-container">
            <button
              onClick={() => {
                setShowFilter((v) => !v)
                setShowSort(false)
              }}
              className="px-5 py-2 bg-white/30 backdrop-blur-md border border-white/40 rounded-2xl shadow-md hover:bg-white/40 transition"
            >
              {travelType || "Filter"}
            </button>

            {showFilter && (
              <div className="absolute right-0 mt-2 min-w-[190px] bg-white backdrop-blur-xl border border-blue-100 rounded-2xl shadow-xl overflow-hidden z-20">
                <div
                  onClick={() => {
                    setTravelType("")
                    setShowFilter(false)
                  }}
                  className="px-4 py-2 hover:bg-blue-200 cursor-pointer transition"
                >
                  All Types
                </div>

                {travelTypes.map((type) => (
                  <div
                    key={type}
                    onClick={() => {
                      setTravelType(type)
                      setShowFilter(false)
                    }}
                    className="px-4 py-2 hover:bg-blue-200 cursor-pointer transition"
                  >
                    {type}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative sort-container">
            <button
              onClick={() => {
                setShowSort((v) => !v)
                setShowFilter(false)
              }}
              className="px-5 py-2 bg-white/30 backdrop-blur-md border border-white/40 rounded-2xl shadow-md hover:bg-white/40 transition"
            >
              Sort
            </button>

            {showSort && (
              <div className="absolute right-0 mt-2 w-56 bg-white backdrop-blur-xl border border-blue-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div
                  onClick={() => {
                    setSortOption("priceLow")
                    setShowSort(false)
                  }}
                  className="px-4 py-2 hover:bg-blue-200 cursor-pointer transition"
                >
                  Price Low → High
                </div>

                <div
                  onClick={() => {
                    setSortOption("priceHigh")
                    setShowSort(false)
                  }}
                  className="px-4 py-2 hover:bg-blue-200 cursor-pointer transition"
                >
                  Price High → Low
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setSearch("")
              setTravelType("")
              setSortOption("")
              setShowFilter(false)
              setShowSort(false)
            }}
            className="px-5 py-2 rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white font-semibold hover:brightness-110 transition"
          >
            Clear
          </button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <p className="text-center text-gray-500">Loading packages...</p>
        ) : filteredPackages.length === 0 ? (
          <p className="text-center text-gray-500">No packages found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg._id}
                onClick={() => navigate(`/user/packages/${pkg._id}`)}
                className="group bg-white border border-gray-200 rounded-2xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden relative cursor-pointer"
              >
                <button
                  onClick={(e) => toggleWishlist(e, pkg)}
                  className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow hover:scale-110 transition"
                >
                  <span
                    className={`text-xl ${
                      isWishlisted(pkg._id) ? "text-red-500" : "text-gray-400"
                    }`}
                  >
                    {isWishlisted(pkg._id) ? "❤️" : "🤍"}
                  </span>
                </button>

                {pkg.image && (
                  <img
                    src={`${serverURL}/uploads/${pkg.image}`}
                    alt={pkg.title}
                    className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}

                <div className="p-5">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {pkg.title}
                  </h2>

                  <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                    {pkg.description}
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{pkg.price}
                    </p>

                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                      Verified
                    </span>
                  </div>

                  <div className="mt-5 w-full text-center text-sm text-blue-600 font-semibold">
                    View Details →
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Packages