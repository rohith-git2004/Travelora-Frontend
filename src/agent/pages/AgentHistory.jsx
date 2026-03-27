import { useContext, useEffect, useMemo, useState } from "react"
import { AuthContext } from "../../context/AuthContext"
import { getAgentBookingsAPI } from "../../services/bookingAPI"

function AgentBookingHistory() {
  const { user } = useContext(AuthContext)

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState(null)

  const token = useMemo(() => {
    if (user?.token) return user.token
    const ls = localStorage.getItem("user")
    return ls ? JSON.parse(ls)?.token : null
  }, [user])

  useEffect(() => {
    const fetchAgentBookings = async () => {
      try {
        setLoading(true)
        const result = await getAgentBookingsAPI(token)
        setBookings(result?.data || [])
      } catch (error) {
        console.log(error)
        setBookings([])
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchAgentBookings()
    }
  }, [token])

  const getDisplayStatus = (booking) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const travelDate = booking?.travelDate ? new Date(booking.travelDate) : null
    if (travelDate) {
      travelDate.setHours(0, 0, 0, 0)
    }

    if (booking?.status === "cancelled") {
      return {
        label: "Cancelled",
        className: "bg-red-100 text-red-700",
      }
    }

    if (travelDate && travelDate < today) {
      return {
        label: "Completed",
        className: "bg-emerald-100 text-emerald-700",
      }
    }

    return {
      label: "Upcoming",
      className: "bg-blue-100 text-blue-700",
    }
  }

  const filteredBookings = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return bookings.filter((booking) => {
      const titleMatch = booking?.package?.title
        ?.toLowerCase()
        .includes(search.toLowerCase())

      const destinationMatch = booking?.package?.destination
        ?.toLowerCase()
        .includes(search.toLowerCase())

      const userMatch = booking?.user?.name
        ?.toLowerCase()
        .includes(search.toLowerCase())

      const matchesSearch = titleMatch || destinationMatch || userMatch

      const travelDate = booking?.travelDate ? new Date(booking.travelDate) : null
      if (travelDate) {
        travelDate.setHours(0, 0, 0, 0)
      }

      let matchesStatus = true

      if (statusFilter === "cancelled") {
        matchesStatus = booking?.status === "cancelled"
      } else if (statusFilter === "upcoming") {
        matchesStatus =
          booking?.status !== "cancelled" &&
          travelDate &&
          travelDate >= today
      } else if (statusFilter === "completed") {
        matchesStatus =
          booking?.status !== "cancelled" &&
          travelDate &&
          travelDate < today
      }

      return matchesSearch && matchesStatus
    })
  }, [bookings, search, statusFilter])

  const totalBookings = bookings.length

  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "cancelled"
  ).length

  const upcomingTrips = bookings.filter((booking) => {
    if (booking.status === "cancelled") return false

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const travelDate = new Date(booking.travelDate)
    travelDate.setHours(0, 0, 0, 0)

    return travelDate >= today
  }).length

  const completedTrips = bookings.filter((booking) => {
    if (booking.status === "cancelled") return false

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const travelDate = new Date(booking.travelDate)
    travelDate.setHours(0, 0, 0, 0)

    return travelDate < today
  }).length

  const totalRevenue = bookings
    .filter((booking) => booking.status !== "cancelled" && booking.isPaid)
    .reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0)

  const cardClass =
    "bg-white border border-gray-200 rounded-2xl shadow hover:shadow-lg transition-all duration-300"
  const glassClass =
    "bg-white/30 backdrop-blur-md border border-white/40 rounded-2xl shadow-sm"

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-sky-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Booking History</h1>
          <p className="text-gray-600 mt-1">
            View bookings for your packages only
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
          <div className={`${cardClass} p-5`}>
            <p className="text-sm text-gray-500">Total Bookings</p>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">
              {totalBookings}
            </h2>
          </div>

          <div className={`${cardClass} p-5`}>
            <p className="text-sm text-gray-500">Upcoming Trips</p>
            <h2 className="text-2xl font-bold text-blue-600 mt-2">
              {upcomingTrips}
            </h2>
          </div>

          <div className={`${cardClass} p-5`}>
            <p className="text-sm text-gray-500">Completed Trips</p>
            <h2 className="text-2xl font-bold text-emerald-600 mt-2">
              {completedTrips}
            </h2>
          </div>

          <div className={`${cardClass} p-5`}>
            <p className="text-sm text-gray-500">Cancelled</p>
            <h2 className="text-2xl font-bold text-red-600 mt-2">
              {cancelledBookings}
            </h2>
          </div>

          <div className={`${cardClass} p-5`}>
            <p className="text-sm text-gray-500">Revenue</p>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">
              ₹{totalRevenue.toLocaleString()}
            </h2>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by package, destination, or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${glassClass} px-4 py-3 outline-none placeholder:text-gray-500 md:col-span-2`}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${glassClass} px-4 py-3 outline-none text-gray-700 bg-white`}
          >
            <option value="all">All Bookings</option>
            <option value="upcoming">Upcoming Trips</option>
            <option value="completed">Completed Trips</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className={`${cardClass} p-10 text-center text-gray-600`}>
            Loading booking history...
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredBookings.map((booking) => {
              const displayStatus = getDisplayStatus(booking)

              return (
                <div key={booking._id} className={`${cardClass} p-5`}>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {booking.package?.title || "Package"}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {booking.package?.destination || "Destination not available"}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${displayStatus.className}`}
                    >
                      {displayStatus.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 mb-4">
                    <div>
                      <p className="text-gray-500">Customer</p>
                      <p className="font-medium text-gray-900">
                        {booking.user?.name || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium text-gray-900 break-all">
                        {booking.user?.email || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Travel Date</p>
                      <p className="font-medium text-gray-900">
                        {booking.travelDate
                          ? new Date(booking.travelDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Travellers</p>
                      <p className="font-medium text-gray-900">
                        {booking.numberOfPeople || 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Total Price</p>
                      <p className="font-medium text-gray-900">
                        ₹{Number(booking.totalPrice || 0).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Payment</p>
                      <p
                        className={`font-medium ${
                          booking.isPaid ? "text-emerald-600" : "text-gray-500"
                        }`}
                      >
                        {booking.isPaid ? "Paid" : "Not Paid"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 text-white hover:brightness-110 transition"
                  >
                    View Details
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className={`${cardClass} p-10 text-center`}>
            <h3 className="text-lg font-semibold text-gray-800">
              No bookings found
            </h3>
            <p className="text-gray-500 mt-2">
              No booking history available for your packages.
            </p>
          </div>
        )}

        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Booking Details
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedBooking.package?.title}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition text-gray-700"
                >
                  Close
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Package Info
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Title</p>
                      <p className="font-medium text-gray-900">
                        {selectedBooking.package?.title || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Destination</p>
                      <p className="font-medium text-gray-900">
                        {selectedBooking.package?.destination || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Travel Type</p>
                      <p className="font-medium text-gray-900">
                        {selectedBooking.package?.travelType || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Travel Date</p>
                      <p className="font-medium text-gray-900">
                        {selectedBooking.travelDate
                          ? new Date(selectedBooking.travelDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Customer Info
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">
                        {selectedBooking.user?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium text-gray-900 break-all">
                        {selectedBooking.user?.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">People</p>
                      <p className="font-medium text-gray-900">
                        {selectedBooking.numberOfPeople || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Amount</p>
                      <p className="font-medium text-gray-900">
                        ₹{Number(selectedBooking.totalPrice || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <p className="font-medium text-gray-900">
                        {getDisplayStatus(selectedBooking).label}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Payment</p>
                      <p
                        className={`font-medium ${
                          selectedBooking.isPaid ? "text-emerald-600" : "text-gray-500"
                        }`}
                      >
                        {selectedBooking.isPaid ? "Paid" : "Not Paid"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Travellers
                  </h3>

                  {selectedBooking.travellers?.length > 0 ? (
                    <div className="space-y-3">
                      {selectedBooking.travellers.map((traveller, index) => (
                        <div
                          key={index}
                          className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-gray-500">Name</p>
                              <p className="font-medium text-gray-900">
                                {traveller.name}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Age</p>
                              <p className="font-medium text-gray-900">
                                {traveller.age}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Sex</p>
                              <p className="font-medium text-gray-900 capitalize">
                                {traveller.sex}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Blood Group</p>
                              <p className="font-medium text-gray-900">
                                {traveller.bloodGroup}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No traveller details found.</p>
                  )}
                </div>

                {selectedBooking.status === "cancelled" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Refund Info
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Refund %</p>
                        <p className="font-medium text-gray-900">
                          {selectedBooking.refundPercentage || 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Refund Amount</p>
                        <p className="font-medium text-gray-900">
                          ₹{Number(selectedBooking.refundAmount || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Days Left</p>
                        <p className="font-medium text-gray-900">
                          {selectedBooking.daysLeft ?? "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AgentBookingHistory