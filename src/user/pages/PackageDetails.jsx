import React, { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { getPackageDetailsAPI } from "../../services/userAPI"
import serverURL from "../../services/serverURL"
import {
  createBookingAPI,
  dummyPayAPI,
  downloadReceiptAPI,
} from "../../services/bookingAPI"

function PackageDetails() {
  const { id } = useParams()

  const [pkg, setPkg] = useState(null)
  const [loading, setLoading] = useState(false)

  // Booking inputs
  const [travelDate, setTravelDate] = useState("")
  const [numberOfPeople, setNumberOfPeople] = useState(1)

  // Travellers
  const [travellers, setTravellers] = useState([
    { name: "", age: "", sex: "", bloodGroup: "" },
  ])

  // Payment modal + status
  const [showPayModal, setShowPayModal] = useState(false)
  const [paying, setPaying] = useState(false)

  // Success UI + receipt
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paidBookingId, setPaidBookingId] = useState(null)
  const [bookingMessage, setBookingMessage] = useState("")
  const [downloading, setDownloading] = useState(false)

  // ✅ Alert Toggle (premium glass modal)
  const [alertBox, setAlertBox] = useState({
    show: false,
    message: "",
    type: "info", // success | error | info
  })

  const hideAlert = () => {
    window.clearTimeout(window.__traveloraAlertTimer)
    setAlertBox((p) => ({ ...p, show: false }))
  }

  const showAlert = (message, type = "info") => {
    window.clearTimeout(window.__traveloraAlertTimer)
    setAlertBox({ show: true, message, type })

    window.__traveloraAlertTimer = window.setTimeout(() => {
      setAlertBox((prev) => ({ ...prev, show: false }))
    }, 2200)
  }

  const AlertToggle = () => {
    if (!alertBox.show) return null

    const theme =
      alertBox.type === "success"
        ? {
            ring: "ring-emerald-500/15",
            iconBg: "bg-emerald-500/15 border-emerald-500/25",
            iconText: "text-emerald-700",
            title: "Success",
          }
        : alertBox.type === "error"
        ? {
            ring: "ring-rose-500/15",
            iconBg: "bg-rose-500/15 border-rose-500/25",
            iconText: "text-rose-700",
            title: "Oops",
          }
        : {
            ring: "ring-blue-500/15",
            iconBg: "bg-blue-500/15 border-blue-500/25",
            iconText: "text-blue-700",
            title: "Notice",
          }

    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        {/* soft dim bg */}
        <div className="absolute inset-0 bg-black/20" onClick={hideAlert} />

        {/* glass alert card */}
        <div
          className={`relative w-full max-w-md rounded-2xl border border-white/60 bg-white/85 backdrop-blur-xl ring-1 ${theme.ring} px-5 py-4 alert-pop`}
        >
          <button
            type="button"
            onClick={hideAlert}
            className="absolute right-3 top-3 text-gray-500 hover:text-gray-900 transition"
            aria-label="Close alert"
          >
            ✕
          </button>

          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 w-10 h-10 rounded-xl border flex items-center justify-center ${theme.iconBg}`}
            >
              <span className={`text-lg font-bold ${theme.iconText}`}>
                {alertBox.type === "success"
                  ? "✓"
                  : alertBox.type === "error"
                  ? "!"
                  : "i"}
              </span>
            </div>

            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">{theme.title}</p>
              <p className="text-sm text-gray-700 mt-0.5">{alertBox.message}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (id) loadPackageDetails()
    // eslint-disable-next-line
  }, [id])

  const loadPackageDetails = async () => {
    setLoading(true)
    try {
      const response = await getPackageDetailsAPI(id)
      if (response.status === 200) setPkg(response.data)
      else setPkg(null)
    } catch (err) {
      console.log("Error fetching package:", err)
      setPkg(null)
    } finally {
      setLoading(false)
    }
  }

  // Keep travellers array synced with numberOfPeople
  useEffect(() => {
    const people = Number(numberOfPeople) || 1
    setTravellers((prev) => {
      const next = [...prev]
      while (next.length < people)
        next.push({ name: "", age: "", sex: "", bloodGroup: "" })
      while (next.length > people) next.pop()
      return next
    })
  }, [numberOfPeople])

  // Total price shown on UI
  const totalPrice = useMemo(() => {
    const price = Number(pkg?.price || 0)
    const people = Number(numberOfPeople || 1)
    return price * people
  }, [pkg, numberOfPeople])

  const updateTraveller = (index, key, value) => {
    setTravellers((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [key]: value } : t))
    )
  }

  const validateTravellers = () => {
    for (const t of travellers) {
      if (!t.name?.trim()) return false
      if (t.age === "" || t.age === null || Number(t.age) < 0) return false
      if (!t.sex) return false
      if (!t.bloodGroup?.trim()) return false
    }
    return true
  }

  const handleOpenPayment = () => {
    setBookingMessage("")
    if (!travelDate) return showAlert("Please select travel date", "error")
    if (!validateTravellers())
      return showAlert("Please fill all travelling members details", "error")
    setShowPayModal(true)
  }

  // Create booking -> pay (server confirms)
  const handlePay = async () => {
    try {
      setPaying(true)
      setBookingMessage("")

      const storedUser = JSON.parse(localStorage.getItem("user"))
      if (!storedUser?.token) {
        showAlert("Please login to book", "error")
        return
      }

      if (!travelDate) {
        showAlert("Please select travel date", "error")
        return
      }

      if (!validateTravellers()) {
        showAlert("Please fill all travelling members details", "error")
        return
      }

      const people = Number(numberOfPeople || 1)

      const createRes = await createBookingAPI(
        {
          packageId: pkg._id,
          travelDate,
          numberOfPeople: people,
          travellers: travellers.map((t) => ({
            name: t.name.trim(),
            age: Number(t.age),
            sex: t.sex,
            bloodGroup: t.bloodGroup.trim(),
          })),
        },
        storedUser.token
      )

      const bookingId = createRes?.data?._id
      if (!bookingId) throw new Error("Booking id not found")

      const payRes = await dummyPayAPI(bookingId, storedUser.token)
      if (payRes?.status !== 200) throw new Error("Payment failed")

      setPaidBookingId(bookingId)
      setPaymentSuccess(true)
      setShowPayModal(false)
      setBookingMessage("✅ Payment successful! Your booking is confirmed.")
      showAlert("Payment successful! Booking confirmed.", "success")
    } catch (err) {
      console.log(err)
      showAlert(
        err?.response?.data?.message || err.message || "Payment failed",
        "error"
      )
    } finally {
      setPaying(false)
    }
  }

  const handleDownloadReceipt = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"))
      if (!storedUser?.token) {
        showAlert("Please login", "error")
        return
      }

      if (!paidBookingId) {
        showAlert("Receipt not available", "error")
        return
      }

      setDownloading(true)
      const receiptRes = await downloadReceiptAPI(paidBookingId, storedUser.token)

      const contentType = receiptRes?.headers?.["content-type"] || ""
      if (!contentType.includes("pdf")) {
        showAlert("Receipt not available yet. Please try again.", "error")
        return
      }

      const blob = new Blob([receiptRes.data], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `Travelora_Receipt_${paidBookingId}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      showAlert("Receipt download started", "success")
    } catch (err) {
      console.log(err)
      showAlert("Receipt download failed", "error")
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex justify-center items-center px-6">
        <p className="text-gray-700">Loading package details...</p>
      </div>
    )
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex justify-center items-center px-6">
        <p className="text-gray-700">Package not found</p>
      </div>
    )
  }

 const glassCard =
  "relative overflow-hidden rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-sm shadow-black/10"

const glassHover =
  "transition-all duration-300 hover:bg-white/75 hover:border-white/80 hover:ring-1 hover:ring-sky-200/70 hover:shadow-md hover:shadow-black/10 hover:-translate-y-[2px]"
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <AlertToggle />

      {/* IMAGE */}
      <div className="w-full h-[350px] overflow-hidden bg-black/10 border-b border-black/10">
        <img
          src={`${serverURL}/uploads/${pkg.image}`}
          alt={pkg.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* TITLE */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{pkg.title}</h1>
          <p className="text-gray-700 mt-1">{pkg.destination}</p>
          <p className="text-sm text-gray-600 mt-2">
            {pkg.days} Days / {pkg.nights} Nights
          </p>
        </div>

        {/* PRICE */}
        <div className={`${glassCard} ${glassHover} p-5`}>
          {/* subtle light shine */}
          <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/60 blur-2xl" />
          <p className="text-sm text-gray-700 relative">Price (per person)</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-1 relative">
            ₹{Number(pkg.price || 0).toLocaleString()}
          </h2>
        </div>

        {/* OVERVIEW */}
        <div className={`${glassCard} ${glassHover} p-6`}>
          <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/60 blur-2xl" />
          <h2 className="text-xl font-semibold mb-3 text-gray-900 relative">
            Overview
          </h2>
          <p className="text-gray-700 relative">{pkg.description}</p>
        </div>

        {/* HIGHLIGHTS */}
        {pkg.highlights?.length > 0 && (
          <div className={`${glassCard} ${glassHover} p-6`}>
            <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/60 blur-2xl" />
            <h2 className="text-xl font-semibold mb-3 text-gray-900 relative">
              Highlights
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1 relative">
              {pkg.highlights.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* INCLUSIONS */}
        {pkg.inclusions?.length > 0 && (
          <div className={`${glassCard} ${glassHover} p-6`}>
            <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/60 blur-2xl" />
            <h2 className="text-xl font-semibold mb-3 text-gray-900 relative">
              Inclusions
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1 relative">
              {pkg.inclusions.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* EXCLUSIONS */}
        {pkg.exclusions?.length > 0 && (
          <div className={`${glassCard} ${glassHover} p-6`}>
            <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/60 blur-2xl" />
            <h2 className="text-xl font-semibold mb-3 text-gray-900 relative">
              Exclusions
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1 relative">
              {pkg.exclusions.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ITINERARY */}
        {pkg.itinerary?.length > 0 && (
          <div className={`${glassCard} ${glassHover} p-6`}>
            <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/60 blur-2xl" />
            <h2 className="text-xl font-semibold mb-3 text-gray-900 relative">
              Itinerary
            </h2>
            <div className="space-y-4 relative">
              {pkg.itinerary.map((item, index) => (
                <div
                  key={item._id || index}
                  className="border-b border-black/10 pb-3"
                >
                  <h4 className="font-semibold text-gray-900">{item.day}</h4>
                  <p className="text-gray-700">{item.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOOKING BOX */}
        <div className={`${glassCard} ${glassHover} p-6 flex flex-col gap-4`}>
  <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/60 blur-2xl" />

  {paymentSuccess && paidBookingId ? (
    <>
      {bookingMessage && (
        <h4 className="text-sm text-center text-gray-700 mt-3 relative">
          {bookingMessage}
        </h4>
      )}

      {/* PDF Download button */}
      <button
        type="button"
        onClick={handleDownloadReceipt}
        disabled={downloading}
        className={`mt-4 w-full py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition relative ${
          downloading ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {downloading ? "Preparing your PDF..." : "Download Receipt (PDF)"}
      </button>

      {/* helper text */}
      <p className="text-xs text-gray-600 mt-2 text-center relative">
        Your receipt will download as a PDF file.
      </p>
    </>
  ) : (
    <>
      <h2 className="text-lg font-semibold text-gray-900 relative">
        Book This Package
      </h2>

      {/* DATE INPUT */}
      <input
        type="date"
        value={travelDate}
        onChange={(e) => setTravelDate(e.target.value)}
        className="w-full bg-white border border-gray-300 text-gray-800 rounded-xl px-4 py-3 outline-none focus:border-gray-400 focus:ring-0 relative"
      />

      {/* People count */}
      <div className="flex items-center justify-between relative">
        <p className="font-medium text-gray-800">Travellers Count</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setNumberOfPeople((p) => Math.max(1, Number(p) - 1))
            }
            className="w-10 h-10 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 text-xl"
          >
            −
          </button>

          <div className="min-w-10 text-center font-bold text-gray-900">
            {numberOfPeople}
          </div>

          <button
            type="button"
            onClick={() => setNumberOfPeople((p) => Number(p) + 1)}
            className="w-10 h-10 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 text-xl"
          >
            +
          </button>
        </div>
      </div>

      {/* Travelling Members Details */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 relative">
        <div className="pointer-events-none absolute -top-10 -right-10 h-36 w-36 rounded-full bg-white/70 blur-2xl" />
        <h3 className="font-semibold text-gray-900 mb-4 relative">
          Travelling Members Details
        </h3>

        <div className="space-y-4 relative">
          {travellers.map((t, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-xl p-4 transition-all duration-200 hover:border-gray-300"
            >
              <p className="font-semibold text-sm mb-3 text-gray-900">
                Member {idx + 1}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={t.name}
                  onChange={(e) =>
                    updateTraveller(idx, "name", e.target.value)
                  }
                  className="bg-white border border-gray-300 text-gray-800 placeholder:text-gray-400 rounded-xl px-4 py-3 outline-none focus:border-gray-400 focus:ring-0"
                />

                <input
                  type="number"
                  placeholder="Age"
                  min="0"
                  value={t.age}
                  onChange={(e) =>
                    updateTraveller(idx, "age", e.target.value)
                  }
                  className="bg-white border border-gray-300 text-gray-800 placeholder:text-gray-400 rounded-xl px-4 py-3 outline-none focus:border-gray-400 focus:ring-0"
                />

                <select
                  value={t.sex}
                  onChange={(e) =>
                    updateTraveller(idx, "sex", e.target.value)
                  }
                  className="bg-white border border-gray-300 text-gray-800 rounded-xl px-4 py-3 outline-none focus:border-gray-400 focus:ring-0"
                >
                  <option value="">Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>

                <input
                  type="text"
                  placeholder="Blood Group (e.g., O+)"
                  value={t.bloodGroup}
                  onChange={(e) =>
                    updateTraveller(idx, "bloodGroup", e.target.value)
                  }
                  className="bg-white border border-gray-300 text-gray-800 placeholder:text-gray-400 rounded-xl px-4 py-3 outline-none focus:border-gray-400 focus:ring-0"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="bg-white/70 border border-white/60 rounded-xl p-4 flex justify-between text-sm relative">
        <span className="text-gray-700">Total Price</span>
        <span className="font-bold text-gray-900">
          ₹{totalPrice.toLocaleString()}
        </span>
      </div>

      {/* Book Now */}
      <button
        type="button"
        onClick={handleOpenPayment}
        className="w-full py-3 rounded-xl text-white font-semibold bg-blue-600 hover:bg-blue-700 transition relative"
      >
        Book Now (₹{totalPrice.toLocaleString()})
      </button>

      {bookingMessage && (
        <p className="text-sm text-center text-blue-700 relative">
          {bookingMessage}
        </p>
      )}
    </>
  )}
</div>
      </div>

      {/* PAYMENT MODAL (WHITE GLASS) */}
      {showPayModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowPayModal(false)}
          />

          <div className="relative z-10 w-full max-w-lg backdrop-blur-xl bg-white/90 text-gray-900 rounded-2xl border border-white/70 overflow-hidden">
            <div className="p-5 border-b border-black/10 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Payment</h3>
              <button
                onClick={() => setShowPayModal(false)}
                className="px-3 py-1 rounded-lg bg-black/5 hover:bg-black/10"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Package</span>
                <span className="font-semibold text-gray-900">{pkg.title}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-700">Travel Date</span>
                <span className="font-semibold text-gray-900">
                  {travelDate ? new Date(travelDate).toDateString() : "-"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-700">Travellers</span>
                <span className="font-semibold text-gray-900">
                  {numberOfPeople}
                </span>
              </div>

              <div className="flex justify-between text-base">
                <span className="text-gray-800 font-semibold">Total</span>
                <span className="font-bold text-gray-900">
                  ₹{totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-5 border-t border-black/10">
              <button
                disabled={paying}
                onClick={handlePay}
                className={`w-full py-3 rounded-xl text-white font-semibold bg-blue-600 hover:bg-blue-700 ${
                  paying ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {paying ? "Processing..." : `Pay ₹${totalPrice.toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* animations */}
      <style>{`
        @keyframes alertPop {
          0% { transform: translateY(10px) scale(0.98); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .alert-pop { animation: alertPop 160ms ease-out; }
      `}</style>
    </div>
  )
}

export default PackageDetails