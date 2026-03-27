import { useContext, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import serverURL from "../../services/serverURL"
import { getAgentPackagesAPI, getAgentBookingsAPI } from "../../services/agentAPI"

function AgentDashboard() {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  const [packages, setPackages] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const token = useMemo(() => {
    if (user?.token) return user.token
    const ls = localStorage.getItem("user")
    return ls ? JSON.parse(ls)?.token : null
  }, [user?.token])

  const initials = useMemo(() => {
    const name = user?.name?.trim() || "Agent"
    const parts = name.split(" ").filter(Boolean)
    const first = parts[0]?.[0] || "A"
    const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
    return (first + last).toUpperCase()
  }, [user?.name])

  const profileImage = user?.profileImage || ""
  const profileSrc = profileImage ? `${serverURL}/uploads/${profileImage}` : ""

  const glassCard =
    "relative overflow-hidden rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-sm shadow-black/10"

  const glassHover =
    "transition-all duration-300 hover:bg-white/75 hover:border-white/80 hover:ring-1 hover:ring-sky-200 hover:shadow-md hover:-translate-y-[2px]"

  const fetchDashboardData = async () => {
    try {
      if (!token) return
      setLoading(true)

      const [packagesRes, bookingsRes] = await Promise.all([
        getAgentPackagesAPI(token),
        getAgentBookingsAPI(token),
      ])

      const packagesList = packagesRes?.data?.packages || packagesRes?.data || []
      const bookingsList = bookingsRes?.data?.bookings || bookingsRes?.data || []

      setPackages(Array.isArray(packagesList) ? packagesList : [])
      setBookings(Array.isArray(bookingsList) ? bookingsList : [])
    } catch (err) {
      console.log("AGENT DASHBOARD ERROR:", err)
      setPackages([])
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [token])

  const totalPackages = packages.length

  const approvedPackages = useMemo(
    () =>
      packages.filter(
        (pkg) => String(pkg?.status || "").toLowerCase() === "approved"
      ).length,
    [packages]
  )

  const pendingPackages = useMemo(
    () =>
      packages.filter(
        (pkg) => String(pkg?.status || "").toLowerCase() === "pending"
      ).length,
    [packages]
  )

  const rejectedPackages = useMemo(
    () =>
      packages.filter(
        (pkg) => String(pkg?.status || "").toLowerCase() === "rejected"
      ).length,
    [packages]
  )

  const totalBookings = bookings.length

  const upcomingBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const status = String(booking?.status || "").toLowerCase()
      const rawDate = booking?.travelDate || null
      if (!rawDate || status === "cancelled") return false
      const d = new Date(rawDate)
      if (Number.isNaN(d.getTime())) return false
      return d.getTime() >= Date.now()
    }).length
  }, [bookings])

  const completedBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const status = String(booking?.status || "").toLowerCase()
      const rawDate = booking?.travelDate || null
      if (!rawDate || status === "cancelled") return false
      const d = new Date(rawDate)
      if (Number.isNaN(d.getTime())) return false
      return d.getTime() < Date.now()
    }).length
  }, [bookings])

  const cancelledBookings = useMemo(
    () =>
      bookings.filter(
        (booking) => String(booking?.status || "").toLowerCase() === "cancelled"
      ).length,
    [bookings]
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50">
      <section className="relative min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div>
            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Welcome,{" "}
                  <span className="bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                    {user?.name || "Agent"}
                  </span>
                </h1>

                <p className="mt-2 text-gray-700 max-w-3xl">
                  Manage your travel packages, track approvals, and monitor customer bookings from one professional dashboard.
                </p>
              </div>
            </div>

            <div className={`mt-6 flex items-center justify-between max-w-3xl p-4 ${glassCard}`}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/70 bg-white/60 flex items-center justify-center">
                  {profileSrc ? (
                    <img
                      src={profileSrc}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-900 font-semibold">{initials}</span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="text-gray-900 font-semibold truncate">
                    {user?.name || "Agent"}
                  </div>

                  <div className="text-sm text-gray-700 truncate">
                    {user?.email || "agent@travelora.com"}
                  </div>

                  <div className="text-xs text-gray-600 mt-1">
                    Travelora Agent Panel
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate("/agent/profile")}
                className="px-4 py-2 rounded-xl bg-blue-100 border border-white/70 text-gray-800 text-sm font-medium hover:bg-blue-50 transition"
              >
                Edit
              </button>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-5xl">
            <ActionCard
              title="My Packages"
              subtitle="Manage Packages"
              onClick={() => navigate("/agent/packages")}
              icon={<IconPackage />}
              glassCard={glassCard}
              glassHover={glassHover}
            />

            <ActionCard
              title="Upcoming Trips"
              subtitle="View upcoming bookings"
              onClick={() => navigate("/agent/history")}
              icon={<IconUpcoming />}
              glassCard={glassCard}
              glassHover={glassHover}
            />

            <ActionCard
              title="History"
              subtitle="Booking History"
              onClick={() => navigate("/agent/history")}
              icon={<IconHistory />}
              glassCard={glassCard}
              glassHover={glassHover}
            />
          </div>

          <div className="mt-10">
            <h2 className="text-gray-900 font-semibold text-lg">
              Agent Overview
            </h2>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Total Packages"
                value={loading ? "..." : totalPackages}
                glassCard={glassCard}
                glassHover={glassHover}
              />
              <StatCard
                label="Approved"
                value={loading ? "..." : approvedPackages}
                glassCard={glassCard}
                glassHover={glassHover}
              />
              <StatCard
                label="Pending"
                value={loading ? "..." : pendingPackages}
                glassCard={glassCard}
                glassHover={glassHover}
              />
              <StatCard
                label="Rejected"
                value={loading ? "..." : rejectedPackages}
                glassCard={glassCard}
                glassHover={glassHover}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Total Bookings"
                value={loading ? "..." : totalBookings}
                glassCard={glassCard}
                glassHover={glassHover}
              />
              <StatCard
                label="Upcoming"
                value={loading ? "..." : upcomingBookings}
                glassCard={glassCard}
                glassHover={glassHover}
              />
              <StatCard
                label="Completed"
                value={loading ? "..." : completedBookings}
                glassCard={glassCard}
                glassHover={glassHover}
              />
              <StatCard
                label="Cancelled"
                value={loading ? "..." : cancelledBookings}
                glassCard={glassCard}
                glassHover={glassHover}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function ActionCard({ title, subtitle, onClick, icon, glassCard, glassHover }) {
  return (
    <button onClick={onClick} className={`text-left p-5 ${glassCard} ${glassHover}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-gray-900">{title}</div>
          {subtitle && (
            <div className="text-xs text-gray-600 mt-1">{subtitle}</div>
          )}
        </div>

        <div className="w-10 h-10 rounded-xl bg-white/70 border border-white/70 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </button>
  )
}

function StatCard({ label, value, glassCard, glassHover }) {
  return (
    <div className={`p-4 ${glassCard} ${glassHover}`}>
      <div className="text-xs text-gray-700">{label}</div>
      <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
    </div>
  )
}

function IconCreate() {
  return (
    <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function IconEdit() {
  return (
    <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 20h4l10-10-4-4L4 16v4z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M13 6l4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconPackage() {
  return (
    <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3l7 4-7 4-7-4 7-4zM5 7v8l7 4 7-4V7"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function IconUpcoming() {
  return (
    <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 3v4M17 3v4M3 10h18M5 7h14a2 2 0 0 1 2 2v10H3V9a2 2 0 0 1 2-2z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="15" r="2" fill="currentColor" />
    </svg>
  )
}

function IconHistory() {
  return (
    <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 12a8 8 0 1 0 2.3-5.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M4 4v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default AgentDashboard