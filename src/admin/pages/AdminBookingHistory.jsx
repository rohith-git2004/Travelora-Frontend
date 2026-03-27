import { useEffect, useMemo, useState } from "react"
import { getAllBookingsAdminAPI } from "../../services/bookingAPI"
import serverURL from "../../services/serverURL"

function AdminBookingHistory() {
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

      const res = await getAllBookingsAdminAPI(storedUser.token)
      if (res?.status === 200) setBookings(res.data || [])
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

    return "upcoming"
  }

  const badgeClass = (s) => {
    if (s === "completed")
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
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
          const packageTitle = (b.package?.title || "").toLowerCase()
          const destination = (b.package?.destination || "").toLowerCase()
          const userName = (b.user?.name || "").toLowerCase()
          const userEmail = (b.user?.email || "").toLowerCase()
          const userPhone = (b.user?.phone || "").toLowerCase()

          const matchesSearch =
            packageTitle.includes(q) ||
            destination.includes(q) ||
            userName.includes(q) ||
            userEmail.includes(q) ||
            userPhone.includes(q)

          if (!matchesSearch) return false
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

  const counts = useMemo(() => {
    const mapped = bookings.map((b) => getDisplayStatus(b))

    return {
      total: bookings.length,
      upcoming: mapped.filter((s) => s === "upcoming").length,
      completed: mapped.filter((s) => s === "completed").length,
      cancelled: mapped.filter((s) => s === "cancelled").length,
    }
  }, [bookings])

  const glass =
    "bg-white/30 backdrop-blur-md border border-white/40 rounded-2xl shadow-sm"

  const card =
    "group bg-white border border-gray-200 rounded-2xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden"

  const primaryBtn =
    "px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white font-semibold hover:brightness-110 transition"

  const chipBase =
    "px-4 py-2 rounded-full text-sm font-semibold border transition backdrop-blur-md bg-white/30 border-white/40 shadow-sm"

  const chipActive = "ring-2 ring-sky-200 bg-white/40 text-gray-900"

  const chipIdle = "text-gray-800 hover:bg-white/40"

  const statCard =
    "rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-sm shadow-black/10 p-5"

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-sky-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className={`${glass} p-6 text-center text-gray-700`}>
            Loading booking history...
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
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
                Booking History{" "}
                <span className="bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500 bg-clip-text text-transparent">
                  Admin
                </span>
              </h1>

              <p className="mt-2 text-gray-500 max-w-2xl">
                View all user bookings, payment details, cancellation info, and
                traveller details.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className={statCard}>
                <p className="text-sm text-gray-500">Total Bookings</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {counts.total}
                </h3>
              </div>

              <div className={statCard}>
                <p className="text-sm text-gray-500">Booked / Upcoming</p>
                <h3 className="text-2xl font-bold text-sky-600 mt-1">
                  {counts.upcoming}
                </h3>
              </div>

              <div className={statCard}>
                <p className="text-sm text-gray-500">Completed</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                  {counts.completed}
                </h3>
              </div>

              <div className={statCard}>
                <p className="text-sm text-gray-500">Cancelled</p>
                <h3 className="text-2xl font-bold text-rose-600 mt-1">
                  {counts.cancelled}
                </h3>
              </div>
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder=" ⌕ Search by user, email, phone, package or destination..."
              className="w-full bg-white/30 backdrop-blur-md border border-white/40 rounded-2xl px-4 py-3 outline-none shadow-md placeholder:text-gray-500 mb-4 transition focus:ring-2 focus:ring-sky-300 focus:border-white/60"
            />

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

            {list.length === 0 ? (
              <div className={`${glass} p-10 text-center`}>
                <div className="text-5xl mb-3">📜</div>
                <h2 className="text-xl font-bold text-gray-800">
                  No booking history found
                </h2>
                <p className="text-gray-500 mt-1">
                  Try changing search or filter.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {list.map((b) => (
                  <div key={b._id} className={card}>
                    <div className="flex flex-col sm:flex-row">
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

                      <div className="flex-1 p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {b.package?.title || "Package"}
                          </h3>

                          <p className="text-sm text-gray-500 mt-1">
                            {b.package?.destination || "Destination not added"}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            User: {b.user?.name || "-"}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            {b.travelDate
                              ? new Date(b.travelDate).toDateString()
                              : "-"}
                          </p>

                          <span
                            className={`inline-block mt-3 px-3 py-1 text-xs font-bold rounded-full border capitalize ${badgeClass(
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

      {showModal && selected && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/70 bg-white backdrop-blur-xl shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between rounded-t-3xl">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                Booking Details
              </h3>
              <button
                onClick={closeModal}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Booking Status</p>
                  <p
                    className={`mt-2 inline-block px-3 py-1 text-xs font-bold rounded-full border capitalize ${badgeClass(
                      selected._displayStatus || getDisplayStatus(selected)
                    )}`}
                  >
                    {selected._displayStatus || getDisplayStatus(selected)}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Payment</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {selected.isPaid ? "Paid" : "Not Paid"}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs text-gray-500">Total Price</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    ₹{selected.totalPrice || 0}
                  </p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-gray-200 p-5">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">
                    User Details
                  </h4>

                  <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
                    <DetailItem label="Name" value={selected.user?.name || "-"} />
                    <DetailItem label="Email" value={selected.user?.email || "-"} />
                    <DetailItem label="Phone" value={selected.user?.phone || "-"} />
                    <DetailItem label="Role" value={selected.user?.role || "-"} />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 p-5">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">
                    Package Details
                  </h4>

                  <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
                    <DetailItem
                      label="Package"
                      value={selected.package?.title || "-"}
                    />
                    <DetailItem
                      label="Destination"
                      value={selected.package?.destination || "-"}
                    />
                    <DetailItem
                      label="Travel Date"
                      value={
                        selected.travelDate
                          ? new Date(selected.travelDate).toDateString()
                          : "-"
                      }
                    />
                    <DetailItem
                      label="People Count"
                      value={selected.numberOfPeople || "-"}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5">
                <h4 className="text-lg font-bold text-gray-900 mb-4">
                  Payment & Refund Details
                </h4>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-700">
                  <DetailItem
                    label="Payment Status"
                    value={selected.isPaid ? "Paid" : "Not Paid"}
                  />
                  <DetailItem
                    label="Payment Method"
                    value={selected.paymentMethod || "-"}
                  />
                  <DetailItem
                    label="Payment ID"
                    value={selected.paymentId || "-"}
                  />
                  <DetailItem
                    label="Paid At"
                    value={
                      selected.paidAt
                        ? new Date(selected.paidAt).toLocaleString()
                        : "-"
                    }
                  />
                  <DetailItem
                    label="Refund Amount"
                    value={`₹${selected.refundAmount || 0}`}
                  />
                  <DetailItem
                    label="Refund Percentage"
                    value={
                      selected.refundPercentage
                        ? `${selected.refundPercentage}%`
                        : "0%"
                    }
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-5">
                <h4 className="text-lg font-bold text-gray-900 mb-4">
                  Travellers
                </h4>

                {selected.travellers?.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {selected.travellers.map((traveller, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
                      >
                        <p className="text-sm font-bold text-gray-900 mb-3">
                          Traveller {index + 1}
                        </p>

                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                          <DetailItem label="Name" value={traveller.name || "-"} />
                          <DetailItem label="Age" value={traveller.age ?? "-"} />
                          <DetailItem label="Sex" value={traveller.sex || "-"} />
                          <DetailItem
                            label="Blood Group"
                            value={traveller.bloodGroup || "-"}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No traveller details</p>
                )}
              </div>

              <div className="flex justify-end">
                <button onClick={closeModal} className={primaryBtn}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-gray-900 font-medium break-words">{value}</div>
    </div>
  )
}

export default AdminBookingHistory