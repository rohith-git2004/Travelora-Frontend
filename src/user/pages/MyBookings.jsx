import { useEffect, useMemo, useState } from "react"
import { getMyBookingsAPI, cancelBookingAPI } from "../../services/bookingAPI"
import serverURL from "../../services/serverURL"

function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  // 🔍 Search
  const [search, setSearch] = useState("")

  // View details modal
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // ✅ Cancellation Policy Modal
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelBooking, setCancelBooking] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  // ✅ Show cancel success UI inside modal (no alerts)
  const [cancelResult, setCancelResult] = useState(null) // { refundPercentage, refundAmount, daysLeft }
  const [cancelError, setCancelError] = useState("")

  // ✅ Page-enter animation only (runs once on mount)
  const [pageEnter, setPageEnter] = useState(false)

  useEffect(() => {
    setPageEnter(true)
    fetchBookings()
    // eslint-disable-next-line
  }, [])

  // Close modals on ESC + prevent background scroll
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        closeModal()
        closeCancelModal()
      }
    }

    if (showModal || showCancelModal) {
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
    // eslint-disable-next-line
  }, [showModal, showCancelModal])

  const closeModal = () => {
    setShowModal(false)
    setSelectedBooking(null)
  }

  const openCancelModal = (booking) => {
    setCancelBooking(booking)
    setCancelResult(null)
    setCancelError("")
    setCancelling(false)
    setShowCancelModal(true)
  }

  const closeCancelModal = () => {
    setShowCancelModal(false)
    setCancelBooking(null)
    setCancelling(false)
    setCancelResult(null)
    setCancelError("")
  }

  const fetchBookings = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"))
      if (!storedUser?.token) {
        setLoading(false)
        return
      }

      const response = await getMyBookingsAPI(storedUser.token)
      if (response?.status === 200) {
        setBookings(response.data)
      }
    } catch (error) {
      console.error("Fetch bookings error:", error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Cancel booking
  const handleConfirmCancel = async () => {
    try {
      setCancelError("")
      setCancelResult(null)

      const storedUser = JSON.parse(localStorage.getItem("user"))
      if (!storedUser?.token) {
        setCancelError("Please login again.")
        return
      }
      if (!cancelBooking?._id) return

      setCancelling(true)

      const response = await cancelBookingAPI(cancelBooking._id, storedUser.token)

      if (response?.status === 200) {
        const { refundPercentage, refundAmount, daysLeft } = response.data

        // ✅ update list + store refund data in booking (so View Details can show it)
        setBookings((prev) =>
          prev.map((b) =>
            b._id === cancelBooking._id
              ? {
                  ...b,
                  status: "cancelled",
                  refundPercentage,
                  refundAmount,
                  daysLeft,
                }
              : b
          )
        )

        // ✅ show success UI inside cancel modal
        setCancelResult({ refundPercentage, refundAmount, daysLeft })
      } else {
        setCancelError("Cancellation failed. Please try again.")
      }
    } catch (error) {
      console.log(error)
      setCancelError(
        error?.response?.data?.message || "Cancellation failed. Please try again."
      )
    } finally {
      setCancelling(false)
    }
  }

  // ✅ UI SYSTEM (Packages.jsx based)
  const pageBg = "min-h-screen bg-gradient-to-b from-blue-50 via-white to-sky-50"
  const glass =
    "bg-white/30 backdrop-blur-md border border-white/40 rounded-2xl shadow-sm"
  const dropdownGlass =
    "bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl"
  const primaryBtn =
    "rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white font-semibold hover:brightness-110 transition"
  const cardBase =
    "group bg-white border border-gray-200 rounded-2xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden relative"
  const imageHover = "group-hover:scale-105 transition-transform duration-500"

  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase()
    // ✅ keep badge logic but convert to light-theme friendly colors
    if (s === "confirmed")
      return "bg-emerald-100 text-emerald-700 border-emerald-200"
    if (s === "pending") return "bg-yellow-100 text-yellow-700 border-yellow-200"
    if (s === "cancelled") return "bg-red-100 text-red-700 border-red-200"
    return "bg-gray-100 text-gray-700 border-gray-200"
  }

  // ✅ Only confirmed bookings in this page + search filter
  const confirmedFiltered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return bookings
      .filter((b) => b.status === "confirmed")
      .filter((b) => {
        if (!q) return true
        const title = (b.package?.title || "").toLowerCase()
        const dest = (b.package?.destination || "").toLowerCase()
        return title.includes(q) || dest.includes(q)
      })
  }, [bookings, search])

  // ✅ Upcoming trips only (no past confirmed section)
  const now = new Date()

  const upcomingTrips = useMemo(() => {
    return [...confirmedFiltered]
      .filter((b) => new Date(b.travelDate) >= now)
      .sort((a, b) => new Date(a.travelDate) - new Date(b.travelDate)) // nearest first
  }, [confirmedFiltered, now])

  const totalSpent = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((acc, b) => acc + (b.totalPrice || 0), 0)

  const BookingCard = ({ booking }) => (
    <div className={cardBase}>
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="sm:w-48 h-48 bg-gray-100 flex items-center justify-center overflow-hidden border-b sm:border-b-0 sm:border-r border-gray-200">
          {booking.package?.image ? (
            <img
              src={`${serverURL}/uploads/${booking.package.image}`}
              alt=""
              className={`w-full h-full object-cover ${imageHover}`}
            />
          ) : (
            <div className="text-6xl">🌍</div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {booking.package?.title}
                </h2>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <span>📅</span>
                  <span>{new Date(booking.travelDate).toDateString()}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <span>⏱️</span>
                  <span>{booking.package?.days} Days</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <span>👥</span>
                  <span>{booking.numberOfPeople} People</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <span>💵</span>
                  <span className="font-bold text-blue-600">
                    ₹{booking.totalPrice?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex sm:flex-col gap-2">
              <button
                onClick={() => {
                  setSelectedBooking(booking)
                  setShowModal(true)
                }}
                className={`px-4 py-2 ${primaryBtn}`}
              >
                View Details
              </button>

              <button
                onClick={() => openCancelModal(booking)}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:brightness-110 transition"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const Section = ({ title, subtitle, items }) => {
    if (!items || items.length === 0) return null
    return (
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {subtitle ? <p className="text-sm text-gray-600">{subtitle}</p> : null}
          </div>
          <p className="text-sm text-gray-600">{items.length} confirmed bookings ✅</p>
        </div>

        <div className="space-y-4">
          {items.map((b) => (
            <BookingCard booking={b} key={b._id} />
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={pageBg}>
        <section className="relative min-h-screen">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div className={`p-6 text-center text-gray-700 ${glass}`}>
              Loading bookings...
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className={pageBg}>
      <section className="relative min-h-screen">
        {/* ✅ Page-enter animation wrapper (only once) */}
        <div className={`relative ${pageEnter ? "page-enter" : ""}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                My Bookings{" "}
                <span className="bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500 bg-clip-text text-transparent">
                  ✈️
                </span>
              </h1>
              <p className="mt-2 text-gray-500 max-w-2xl">
                View your confirmed trips, check traveller details, and cancel a
                booking with refund policy.
              </p>
            </div>

            {/* Search + Total */}
            
            <div className="mb-6 flex gap-3 items-center">

              {/* Search */}
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder=" ⌕ Search by package name or destination..."
                className="flex-1 bg-white/30 backdrop-blur-md border border-white/40 rounded-2xl px-4 py-3 outline-none shadow-md placeholder:text-gray-500"
              />

              {/* Total Spent */}
              <div className={`px-4 py-3 text-sm flex items-center justify-between min-w-[220px] shadow-md ${glass}`}>
                <span className="text-gray-600">Total Spent</span>
                <span className="font-bold text-gray-900">
                  ₹{totalSpent.toLocaleString()}
                </span>
              </div>

            </div>

            {/* Empty */}
            {confirmedFiltered.length === 0 ? (
              <div className={`p-10 text-center ${glass}`}>
                <div className="text-5xl mb-3">🧳</div>
                <h2 className="text-xl font-bold text-gray-800">
                  No confirmed bookings
                </h2>
                <p className="text-gray-500 mt-1">
                  After successful payment, your booking will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-10">
                {/* ✅ Upcoming only */}
                <Section title="Upcoming Trips" items={upcomingTrips} />

                {upcomingTrips.length === 0 && (
                  <div className={`p-10 text-center ${glass}`}>
                    <div className="text-5xl mb-3">🗓️</div>
                    <h2 className="text-xl font-bold text-gray-800">
                      No upcoming trips
                    </h2>
                    <p className="text-gray-500 mt-1">
                      Your confirmed bookings with future travel dates will appear
                      here.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ✅ VIEW DETAILS MODAL (NO animations) */}
        
        {showModal && selectedBooking && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="absolute inset-0 bg-black/40" onClick={closeModal} />

            <div className="relative z-10 w-full max-w-2xl rounded-3xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>

                <button
                  onClick={closeModal}
                  className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex gap-4">
                  <div className="w-32 h-24 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                    {selectedBooking.package?.image ? (
                      <img
                        src={`${serverURL}/uploads/${selectedBooking.package.image}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-3xl">🌍</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-gray-900 truncate">
                      {selectedBooking.package?.title}
                    </p>

                    <p className="text-sm text-gray-600 mt-1">
                      Status:{" "}
                      <span className="font-semibold text-gray-900">
                        {selectedBooking.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-gray-50 border border-gray-200 p-3">
                    <p className="text-gray-600">Travel Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedBooking.travelDate).toDateString()}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 border border-gray-200 p-3">
                    <p className="text-gray-600">People</p>
                    <p className="font-semibold text-gray-900">
                      {selectedBooking.numberOfPeople}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 border border-gray-200 p-3">
                    <p className="text-gray-600">Days</p>
                    <p className="font-semibold text-gray-900">
                      {selectedBooking.package?.days}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 border border-gray-200 p-3">
                    <p className="text-gray-600">Total Price</p>
                    <p className="font-semibold text-gray-900">
                      ₹{selectedBooking.totalPrice?.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* ✅ Refund Info (only if cancelled) */}
                {selectedBooking.status === "cancelled" && (
                  <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4">
                    <p className="font-bold text-rose-700 mb-2">Refund Information</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Refund eligible</span>
                        <span className="font-semibold text-gray-900">
                          {selectedBooking.refundPercentage ?? 0}%
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Refund amount</span>
                        <span className="font-bold text-gray-900">
                          ₹{Number(selectedBooking.refundAmount || 0).toLocaleString()}
                        </span>
                      </div>

                      {selectedBooking.daysLeft !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Days remaining</span>
                          <span className="font-semibold text-gray-900">
                            {selectedBooking.daysLeft}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ✅ Travellers Details */}
                {Array.isArray(selectedBooking.travellers) &&
                  selectedBooking.travellers.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold text-gray-900 mb-2">
                        Travellers Details
                      </p>

                      <div className="border border-gray-200 rounded-2xl overflow-hidden">
                        <div className="grid grid-cols-4 bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2">
                          <div>Name</div>
                          <div>Age</div>
                          <div>Gender</div>
                          <div>Blood Group</div>
                        </div>

                        {selectedBooking.travellers.map((t, idx) => (
                          <div
                            key={idx}
                            className="grid grid-cols-4 text-sm px-3 py-2 border-t border-gray-200 bg-white"
                          >
                            <div className="text-gray-900">{t?.name || "-"}</div>
                            <div className="text-gray-900">{t?.age ?? "-"}</div>
                            <div className="text-gray-900">{t?.sex || "-"}</div>
                            <div className="text-gray-900">{t?.bloodGroup || "-"}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <div className="p-5 border-t border-gray-200 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ CANCELLATION POLICY MODAL (LIGHT / NO GLASS) */}
        {showCancelModal && cancelBooking && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="absolute inset-0 bg-black/40" onClick={closeCancelModal} />

            <div className="relative z-10 w-full max-w-lg rounded-3xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {cancelResult ? "Cancellation Confirmed" : "Cancellation Policy"}
                </h3>

                <button
                  onClick={closeCancelModal}
                  className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 text-sm">
                {cancelResult ? (
                  <div className="rounded-2xl p-4 bg-emerald-50 border border-emerald-200">
                    <p className="font-semibold text-emerald-700">
                      Booking cancelled successfully.
                    </p>

                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Days remaining</span>
                        <span className="font-semibold text-gray-900">
                          {cancelResult.daysLeft}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Refund eligible</span>
                        <span className="font-semibold text-gray-900">
                          {cancelResult.refundPercentage}%
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Refund amount</span>
                        <span className="font-bold text-gray-900">
                          ₹{Number(cancelResult.refundAmount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={closeCancelModal}
                      className="mt-4 w-full px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="font-semibold text-gray-900">
                      {cancelBooking.package?.title}
                    </p>

                    <p className="text-gray-600">
                      Travel Date: {new Date(cancelBooking.travelDate).toDateString()}
                    </p>

                    {/* ✅ Policy box (solid, not glass) */}
                    <div className="mt-2 rounded-2xl p-4 bg-gray-50 border border-gray-200 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">7 days or more before travel</span>
                        <span className="font-semibold text-emerald-700">75% refund</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Between 3 and 6 days before travel</span>
                        <span className="font-semibold text-yellow-700">50% refund</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Less than 3 days before travel</span>
                        <span className="font-semibold text-rose-700">No refund</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500">
                      Refund amount will be calculated automatically based on your travel date.
                    </p>

                    {cancelError && (
                      <p className="text-sm text-rose-700 font-semibold">{cancelError}</p>
                    )}
                  </>
                )}
              </div>

              {!cancelResult && (
                <div className="p-5 border-t border-gray-200 flex gap-3">
                  <button
                    onClick={closeCancelModal}
                    className="w-full px-4 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 font-semibold text-gray-900 transition"
                  >
                    Back
                  </button>

                  <button
                    disabled={cancelling}
                    onClick={handleConfirmCancel}
                    className={`w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 hover:brightness-110 font-semibold text-white transition ${
                      cancelling ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {cancelling ? "Cancelling..." : "Cancel Booking"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

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
      </section>
    </div>
  )
}

export default MyBookings