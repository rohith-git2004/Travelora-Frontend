import { useEffect, useMemo, useState } from "react"
import { getMyBookingsAPI } from "../../services/bookingAPI"
import serverURL from "../../services/serverURL"

function BookingHistory() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const [pageEnter, setPageEnter] = useState(false)

  useEffect(() => {
    setPageEnter(true)
    fetchBookings()
  }, [])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeModal()
    }

    if (showModal) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", onKeyDown)
    } else {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKeyDown)
    }

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [showModal])

  const closeModal = () => {
    setShowModal(false)
    setSelected(null)
  }

  const fetchBookings = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"))
      if (!storedUser?.token) {
        setLoading(false)
        return
      }

      const res = await getMyBookingsAPI(storedUser.token)
      if (res?.status === 200) setBookings(res.data)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const today = new Date()

  const normalizeStatus = (rawStatus) => {
    const s = (rawStatus || "").toLowerCase()
    if (s === "confirmed") return "upcoming"
    if (s === "upcoming" || s === "completed" || s === "cancelled") return s
    return "upcoming"
  }

  const getDisplayStatus = (b) => {
    const base = normalizeStatus(b.status)
    if (base === "cancelled") return "cancelled"

    const travel = new Date(b.travelDate)
    const isPast = !isNaN(travel.getTime()) && travel < today
    if (isPast) return "completed"

    return base
  }

  const badgeClass = (s) => {
    if (s === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (s === "upcoming") return "bg-sky-50 text-sky-700 border-sky-200"
    if (s === "cancelled") return "bg-rose-50 text-rose-700 border-rose-200"
    return "bg-white text-gray-700 border-gray-200"
  }

  const list = useMemo(() => {
    const q = search.trim().toLowerCase()

    return bookings
      .map((b) => ({ ...b, _displayStatus: getDisplayStatus(b) }))
      .filter((b) => {
        if (q) {
          const title = (b.package?.title || "").toLowerCase()
          const dest = (b.package?.destination || "").toLowerCase()
          if (!title.includes(q) && !dest.includes(q)) return false
        }

        if (filterStatus === "all") return true
        return b._displayStatus === filterStatus
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
      )
  }, [bookings, search, filterStatus])

  const glass =
    "bg-white/30 backdrop-blur-md border border-white/40 rounded-2xl shadow-sm"

  const card =
    "group bg-white border border-gray-200 rounded-2xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden"

  const primaryBtn =
    "px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white font-semibold hover:brightness-110 transition"

const chipBase =
  "px-4 py-2 rounded-full text-sm font-semibold border transition backdrop-blur-md bg-white/30 border-white/40 shadow-sm"

const chipActive =
  "ring-2 ring-sky-200 bg-white/40 text-gray-900"

const chipIdle =
  "text-gray-800 hover:bg-white/40"

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-sky-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className={`${glass} p-6 text-center text-gray-700`}>
            Loading history...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-sky-50">
      <section className="relative min-h-screen">
        <div className={`relative ${pageEnter ? "page-enter" : ""}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                Booking History{" "}
                <span className="bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500 bg-clip-text text-transparent">
                  ✈️
                </span>
              </h1>

              <p className="mt-2 text-gray-500 max-w-2xl">
                Search your trips, check payment/refund details, and view traveller information.
              </p>
            </div>

            {/* Search */}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder=" ⌕ Search by package name or destination..."
              className="w-full bg-white/30  backdrop-blur-md border border-white/40 rounded-2xl px-4 py-3 outline-none shadow-md placeholder:text-gray-500 mb-4 transition focus:ring-2 focus:ring-sky-300 focus:border-white/60"
            />

            {/* Glass Filter Toggle */}
            <div className="mb-6 flex flex-wrap gap-2">
              {[
                { key: "all", label: "All" },
                { key: "upcoming", label: "Upcoming" },
                { key: "completed", label: "Completed" },
                { key: "cancelled", label: "Cancelled" },
              ].map((c) => (
                <button
                  key={c.key}
                  onClick={() => setFilterStatus(c.key)}
                  className={`${chipBase} ${
                    filterStatus === c.key ? chipActive : chipIdle
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* List */}
            {list.length === 0 ? (
              <div className={`${glass} p-10 text-center`}>
                <div className="text-5xl mb-3">📜</div>
                <h2 className="text-xl font-bold text-gray-800">
                  No history found
                </h2>
                <p className="text-gray-500 mt-1">
                  Try changing search / filter.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {list.map((b) => (
                  <div key={b._id} className={card}>
                    <div className="flex flex-col sm:flex-row">

                      {/* Image */}
                      <div className="sm:w-56 h-44 bg-gray-100 overflow-hidden flex items-center justify-center border-b sm:border-b-0 sm:border-r border-gray-200">
                        {b.package?.image ? (
                          <img
                            src={`${serverURL}/uploads/${b.package.image}`}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="text-5xl">🧳</div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {b.package?.title || "Package"}
                          </h3>

                          <p className="text-sm text-gray-500 mt-1">
                            {b.travelDate
                              ? new Date(b.travelDate).toDateString()
                              : "-"}
                          </p>

                          <span
                            className={`inline-block mt-3 px-3 py-1 text-xs font-bold rounded-full border ${badgeClass(
                              b._displayStatus
                            )}`}
                          >
                            {b._displayStatus}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setSelected(b)
                            setShowModal(true)
                          }}
                          className={primaryBtn}
                        >
                          View Details
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* Animation */}
        <style>{`
          .page-enter {
            animation: pageEnter 0.45s ease-out both;
          }
          @keyframes pageEnter {
            from { opacity: 0; transform: translateY(14px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

      </section>
    </div>
  )
}

export default BookingHistory