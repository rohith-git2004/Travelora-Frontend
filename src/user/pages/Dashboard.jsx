import { useContext, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import serverURL from "../../services/serverURL"
import { getMyBookingsAPI } from "../../services/bookingAPI"

function Dashboard() {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  })

  const [spend, setSpend] = useState({
    totalSpent: 0,
    paid: 0,
    refunded: 0,
    pending: 0,
  })

  const initials = useMemo(() => {
    const name = user?.name?.trim() || "Traveler"
    const parts = name.split(" ").filter(Boolean)
    const first = parts[0]?.[0] || "T"
    const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
    return (first + last).toUpperCase()
  }, [user?.name])

  const profileImage = user?.profileImage || ""
  const profileSrc = profileImage ? `${serverURL}/uploads/${profileImage}` : ""

  const token = useMemo(() => {
    if (user?.token) return user.token
    const ls = localStorage.getItem("user")
    return ls ? JSON.parse(ls)?.token : null
  }, [user?.token])

  const normalizeStatus = (b) => {
    const s =
      b?.status ??
      b?.bookingStatus ??
      b?.booking_status ??
      b?.paymentStatus ??
      b?.payment_status ??
      ""
    return String(s).toLowerCase()
  }

  const getTravelDate = (b) => {
    const raw =
      b?.travelDate ||
      b?.date ||
      b?.journeyDate ||
      b?.tripDate ||
      b?.startDate ||
      b?.travel_date ||
      null
    if (!raw) return null
    const d = new Date(raw)
    return Number.isNaN(d.getTime()) ? null : d
  }

  const isPast = (d) => d && d.getTime() < Date.now()

  const getAmount = (b) => {
    const raw =
      b?.totalPrice ??
      b?.totalAmount ??
      b?.amount ??
      b?.price ??
      b?.packagePrice ??
      b?.grandTotal ??
      b?.total_price ??
      b?.total_amount ??
      0
    const n = Number(raw)
    return Number.isFinite(n) ? n : 0
  }

  const getRefund = (b) => {
    const raw =
      b?.refundAmount ??
      b?.refundedAmount ??
      b?.refund ??
      b?.refund_amount ??
      b?.refunded_amount ??
      0
    const n = Number(raw)
    return Number.isFinite(n) ? n : 0
  }

  const isPaidBooking = (b) => {
    const s = normalizeStatus(b)
    return (
      s.includes("paid") ||
      s.includes("success") ||
      s === "paymentdone" ||
      b?.isPaid === true ||
      b?.paid === true
    )
  }

  const isCancelledBooking = (b) => {
    const s = normalizeStatus(b)
    return s.includes("cancel") || s === "refunded"
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!token) return

        const res = await getMyBookingsAPI(token)
        const list = res?.data?.bookings || res?.data || []
        const bookings = Array.isArray(list) ? list : []

        let total = bookings.length
        let cancelled = 0
        let completed = 0
        let confirmed = 0

        bookings.forEach((b) => {
          const status = normalizeStatus(b)
          const travelDate = getTravelDate(b)

          const isCancelled = status.includes("cancel") || status === "refunded"
          const isCompleted =
            status.includes("complete") ||
            status.includes("finished") ||
            status === "done" ||
            isPast(travelDate)

          const isConfirmed = !isCancelled && !isCompleted

          if (isCancelled) cancelled += 1
          else if (isCompleted) completed += 1
          else if (isConfirmed) confirmed += 1
        })

        setStats({ total, confirmed, completed, cancelled })

        let totalSpent = 0
        let paid = 0
        let refunded = 0

        bookings.forEach((b) => {
          const amt = getAmount(b)
          const ref = getRefund(b)
          const paidFlag = isPaidBooking(b)
          const cancelledFlag = isCancelledBooking(b)

          totalSpent += amt
          if (paidFlag) paid += amt

          if (ref > 0) refunded += ref
          else if (cancelledFlag && paidFlag) refunded += 0
        })

        const pending = Math.max(paid - refunded, 0)

        setSpend({
          totalSpent: round2(totalSpent),
          paid: round2(paid),
          refunded: round2(refunded),
          pending: round2(pending),
        })
      } catch (err) {
        console.log("DASHBOARD ERROR:", err)
      }
    }

    fetchDashboardData()
  }, [token])

  const glassCard =
    "relative overflow-hidden rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-sm shadow-black/10"

  const glassHover =
    "transition-all duration-300 hover:bg-white/75 hover:border-white/80 hover:ring-1 hover:ring-sky-200 hover:shadow-md hover:-translate-y-[2px]"

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50">
      <section className="relative min-h-screen">

        <div className="max-w-7xl mx-auto px-6 py-14">

          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 border border-white/60 px-3 py-1 text-xs text-gray-700 backdrop-blur">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Account Active
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-gray-900">
              Welcome,{" "}
              <span className="bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                {user?.name || "Traveler"}
              </span>
            </h1>

            <p className="mt-2 text-gray-700 max-w-2xl">
              Your Travelora dashboard helps you manage bookings, explore packages, and keep your profile up to date.
            </p>

            {/* USER MINI PROFILE */}
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

                  <div className="text-xs text-gray-600 mt-t">
                    Customer Account
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE BUTTON */}
              <button
                onClick={() => navigate("/user/profile")}
                className="px-4 py-2 rounded-xl bg-blue-100 border border-white/70 text-gray-800 text-sm font-medium hover:bg-blue-50 transition"
              >
                Edit
              </button>

            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl">

            <ActionCard
              title="My Bookings"
              subtitle="Manage bookings"
              onClick={() => navigate("/user/bookings")}
              icon={<IconTicket />}
              glassCard={glassCard}
              glassHover={glassHover}
            />

            <ActionCard
              title="History"
              subtitle="Past trips"
              onClick={() => navigate("/user/history")}
              icon={<IconReceipt />}
              glassCard={glassCard}
              glassHover={glassHover}
            />

            <ActionCard
              title="Saved"
              subtitle="Wishlist packages"
              onClick={() => navigate("/user/saved")}
              icon={<IconHeart />}
              glassCard={glassCard}
              glassHover={glassHover}
            />
          </div>

          {/* BOOKING SUMMARY */}
          <div className="mt-10 max-w-4xl">
            <h2 className="text-gray-900 font-semibold text-lg">
              Booking summary
            </h2>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Total" value={stats.total} glassCard={glassCard} glassHover={glassHover}/>
              <StatCard label="Confirmed" value={stats.confirmed} glassCard={glassCard} glassHover={glassHover}/>
              <StatCard label="Completed" value={stats.completed} glassCard={glassCard} glassHover={glassHover}/>
              <StatCard label="Cancelled" value={stats.cancelled} glassCard={glassCard} glassHover={glassHover}/>
            </div>
          </div>

          {/* SPEND ANALYSIS */}
          <div className="mt-10 max-w-4xl">
            <h2 className="text-gray-900 font-semibold text-lg">
              Spend analysis
            </h2>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MoneyCard label="Total Spent" value={formatINR(spend.totalSpent)} glassCard={glassCard} glassHover={glassHover}/>
              <MoneyCard label="Paid" value={formatINR(spend.paid)} glassCard={glassCard} glassHover={glassHover}/>
              <MoneyCard label="Refunded" value={formatINR(spend.refunded)} glassCard={glassCard} glassHover={glassHover}/>
              <MoneyCard label="Net Paid" value={formatINR(spend.pending)} glassCard={glassCard} glassHover={glassHover}/>
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}

/* Quick Action Card */
function ActionCard({ title, subtitle, onClick, icon, glassCard, glassHover }) {
  return (
    <button onClick={onClick} className={`text-left p-5 ${glassCard} ${glassHover}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold text-gray-900">{title}</div>
          <div className="text-xs text-gray-700 mt-1">{subtitle}</div>
        </div>

        <div className="w-10 h-10 rounded-xl bg-white/70 border border-white/70 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </button>
  )
}

/* Stats Cards */
function StatCard({ label, value, glassCard, glassHover }) {
  return (
    <div className={`p-4 ${glassCard} ${glassHover}`}>
      <div className="text-xs text-gray-700">{label}</div>
      <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-600 mt-1">From your bookings</div>
    </div>
  )
}

function MoneyCard({ label, value, glassCard, glassHover }) {
  return (
    <div className={`p-4 ${glassCard} ${glassHover}`}>
      <div className="text-xs text-gray-700">{label}</div>
      <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-600 mt-1">Auto calculated</div>
    </div>
  )
}

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0))
}

function round2(n) {
  return Math.round(Number(n || 0) * 100) / 100
}

function IconTicket() {
  return (
    <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="8" width="16" height="8" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  )
}

function IconReceipt() {
  return (
    <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="none">
      <path d="M6 3h12v18l-2-1-2 1-2-1-2 1-2-1-2 1V3z" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  )
}

function IconHeart() {
  return (
    <svg className="w-5 h-5 text-gray-900" viewBox="0 0 24 24" fill="none">
      <path d="M12 21s-7-4.5-9-9c-1.4-3 1-6 4.2-6 1.6 0 3 1 3.8 2.2C11.8 7 13.2 6 14.8 6c3.2 0 5.6 3 4.2 6-2 4.5-9 9-9 9z" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  )
}

export default Dashboard