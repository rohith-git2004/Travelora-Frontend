import { useContext, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import serverURL from "../../services/serverURL"
import { getAllUsersAdminAPI } from "../../services/userAPI"
import { getAllPackagesAdminAPI } from "../../services/adminAPI"
import { getAllBookingsAdminAPI } from "../../services/bookingAPI"

function Dashboard() {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  const [users, setUsers] = useState([])
  const [packages, setPackages] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const token = useMemo(() => {
    if (user?.token) return user.token
    const ls = localStorage.getItem("user")
    return ls ? JSON.parse(ls)?.token : null
  }, [user?.token])

  const initials = useMemo(() => {
    const name = user?.name?.trim() || "Admin"
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

      const [usersRes, packagesRes, bookingsRes] = await Promise.all([
        getAllUsersAdminAPI(token),
        getAllPackagesAdminAPI(token),
        getAllBookingsAdminAPI(token),
      ])

      const usersList = usersRes?.data?.users || usersRes?.data || []
      const packagesList = packagesRes?.data?.packages || packagesRes?.data || []
      const bookingsList = bookingsRes?.data?.bookings || bookingsRes?.data || []

      setUsers(Array.isArray(usersList) ? usersList : [])
      setPackages(Array.isArray(packagesList) ? packagesList : [])
      setBookings(Array.isArray(bookingsList) ? bookingsList : [])
    } catch (err) {
      console.log("ADMIN DASHBOARD ERROR:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [token])

  const totalAccounts = users.length

  const totalUsers = useMemo(
    () => users.filter((u) => u.role === "user").length,
    [users]
  )

  const totalAgents = useMemo(
    () => users.filter((u) => u.role === "agent").length,
    [users]
  )

  const totalAdmins = useMemo(
    () => users.filter((u) => u.role === "admin").length,
    [users]
  )

  const totalBookings = bookings.length

  const totalCancelled = useMemo(
    () =>
      bookings.filter(
        (b) => String(b?.status || "").toLowerCase() === "cancelled"
      ).length,
    [bookings]
  )

  const totalCompleted = useMemo(() => {
    return bookings.filter((b) => {
      const status = String(b?.status || "").toLowerCase()
      const rawDate = b?.travelDate || null
      if (!rawDate) return false
      const d = new Date(rawDate)
      if (Number.isNaN(d.getTime())) return false
      return status === "confirmed" && d.getTime() < Date.now()
    }).length
  }, [bookings])

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
                    {user?.name || "Administrator"}
                  </span>
                </h1>

                <p className="mt-2 text-gray-700 max-w-3xl">
                  Manage Travelora operations, review platform activity, and access all core administrative controls from one dashboard.
                </p>
              </div>
            </div>

            <div className={`mt-6 flex items-center justify-between max-w-2xl p-4 ${glassCard}`}>
              {/* LEFT SIDE */}
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
                    {user?.name || "Administrator"}
                  </div>

                  <div className="text-sm text-gray-700 truncate">
                    {user?.email || "admin@travelora.com"}
                  </div>

                  <div className="text-xs text-gray-600 mt-1">
                    Travelora Admin Panel
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE BUTTON */}
              <button
                onClick={() => navigate("/admin/profile")}
                className="px-4 py-2 rounded-xl bg-blue-100 border border-white/70 text-gray-800 text-sm font-medium hover:bg-blue-50 transition"
              >
                Edit
              </button>

            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-5xl">
            <ActionCard
              title="Account"
              subtitle="Admin / Agent / User"
              value={loading ? "..." : totalAccounts}
              onClick={() => navigate("/admin/users")}
              icon={<IconUsers />}
              glassCard={glassCard}
              glassHover={glassHover}
            />

            <ActionCard
              title="Create Account"
              subtitle="Admin / Agent"
              value={loading ? "..." : totalAgents + totalAdmins}
              onClick={() => navigate("/admin/create-agent")}
              icon={<IconCreate />}
              glassCard={glassCard}
              glassHover={glassHover}
            />

            <ActionCard
              title="Packages"
              subtitle="Approve / Reject"
              value={loading ? "..." : packages.length}
              onClick={() => navigate("/admin/packages")}
              icon={<IconPackage />}
              glassCard={glassCard}
              glassHover={glassHover}
            />

            <ActionCard
              title="History"
              subtitle="Package History"
              value={loading ? "..." : totalBookings}
              onClick={() => navigate("/admin/bookings")}
              icon={<IconBookings />}
              glassCard={glassCard}
              glassHover={glassHover}
            />
          </div>

          <div className="mt-10">
            <h2 className="text-gray-900 font-semibold text-lg">
              Platform Overview
            </h2>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
              <StatCard
                label="Total Accounts"
                value={loading ? "..." : totalAccounts}
                glassCard={glassCard}
                glassHover={glassHover}
              />
              <StatCard
                label="Users"
                value={loading ? "..." : totalUsers}
                glassCard={glassCard}
                glassHover={glassHover}
              />
              <StatCard
                label="Agents"
                value={loading ? "..." : totalAgents}
                glassCard={glassCard}
                glassHover={glassHover}
              />
              <StatCard
                label="Admins"
                value={loading ? "..." : totalAdmins}
                glassCard={glassCard}
                glassHover={glassHover}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
                <StatCard
                  label="Total Packages"
                  value={loading ? "..." : packages.length}
                  glassCard={glassCard}
                  glassHover={glassHover}
                />
                <StatCard
                  label="Total Bookings"
                  value={loading ? "..." : totalBookings}
                  glassCard={glassCard}
                  glassHover={glassHover}
                />
                <StatCard
                  label="Cancelled"
                  value={loading ? "..." : totalCancelled}
                  glassCard={glassCard}
                  glassHover={glassHover}
                />
                <StatCard
                  label="Completed"
                  value={loading ? "..." : totalCompleted}
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

function ActionCard({ title, subtitle, value, onClick, icon, glassCard, glassHover }) {
  return (
    <button onClick={onClick} className={`text-left p-5 ${glassCard} ${glassHover}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-gray-900">{title}</div>

          {subtitle && (
            <div className="text-xs text-gray-600 mt-1">{subtitle}</div>
          )}

          <div className="mt-3 text-2xl font-bold text-gray-900">{value}</div>
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

function IconUsers() {
  return (
    <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3.5 19c1.7-3.3 4.8-5 7.5-5s5.8 1.7 7.5 5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
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

function IconBookings() {
  return (
    <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="6"
        width="16"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export default Dashboard