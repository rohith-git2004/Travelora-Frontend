import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { createPackageAPI } from "../../services/agentAPI"

function CreatePackage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: "",
    destination: "",
    travelType: "",
    price: "",
    days: "",
    nights: "",
    companyName: "",
    contactNumber: "",
    highlights: "",
    inclusions: "",
    exclusions: "",
    itinerary: "",
    description: "",
  })

  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)

  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showErrorToast, setShowErrorToast] = useState(false)
  const [toastMsg, setToastMsg] = useState("")
  const [loading, setLoading] = useState(false)
  const [showTravelTypeDropdown, setShowTravelTypeDropdown] = useState(false)

  const fileRef = useRef(null)
  const travelTypeRef = useRef(null)

  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null

  const token = user?.token

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
    const handleClickOutside = (event) => {
      if (
        travelTypeRef.current &&
        !travelTypeRef.current.contains(event.target)
      ) {
        setShowTravelTypeDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    setImage(file)
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  const handleTravelTypeSelect = (type) => {
    setForm((prev) => ({ ...prev, travelType: type }))
    setShowTravelTypeDropdown(false)
  }

  const resetForm = () => {
    setForm({
      title: "",
      destination: "",
      travelType: "",
      price: "",
      days: "",
      nights: "",
      companyName: "",
      contactNumber: "",
      highlights: "",
      inclusions: "",
      exclusions: "",
      itinerary: "",
      description: "",
    })

    setImage(null)
    setPreview(null)
    setShowTravelTypeDropdown(false)

    if (fileRef.current) fileRef.current.value = ""
  }

  const showToast = (type, message) => {
    setToastMsg(message)

    if (type === "success") {
      setShowErrorToast(false)
      setShowSuccessToast(true)
      setTimeout(() => setShowSuccessToast(false), 3000)
    } else {
      setShowSuccessToast(false)
      setShowErrorToast(true)
      setTimeout(() => setShowErrorToast(false), 3000)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.travelType) {
      showToast("error", "Please select a travel type")
      return
    }

    const formData = new FormData()

    Object.keys(form).forEach((key) => {
      formData.append(key, form[key])
    })

    if (image) formData.append("image", image)

    try {
      setLoading(true)

      const res = await createPackageAPI(formData, token)

      const status = res?.status
      const data = res?.data ?? res

      const isSuccess =
        status === 200 ||
        status === 201 ||
        data?.success === true ||
        !!data?.package ||
        data?.message?.toLowerCase()?.includes("created")

      if (isSuccess) {
        showToast(
          "success",
          "Package created successfully. Waiting for admin approval."
        )
        resetForm()
      } else {
        showToast("error", data?.message || "Error creating package")
      }
    } catch (error) {
      console.log(error)
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Error creating package"
      showToast("error", msg)
    } finally {
      setLoading(false)
    }
  }

  const glassCard =
    "rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl shadow-sm shadow-black/10"
  const inputClass =
    "w-full rounded-2xl border border-white/40 bg-white/30 backdrop-blur-md px-4 py-3 outline-none shadow-sm placeholder:text-gray-500 focus:border-blue-200 focus:ring-2 focus:ring-blue-100 transition"
  const textareaClass =
    "w-full rounded-2xl border border-white/40 bg-white/30 backdrop-blur-md px-4 py-3 outline-none shadow-sm placeholder:text-gray-500 focus:border-blue-200 focus:ring-2 focus:ring-blue-100 transition min-h-[110px] resize-none"
  const labelClass = "mb-1.5 block text-sm font-medium text-gray-700"

  return (
    <>
      {showSuccessToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/50 bg-white/90 backdrop-blur-xl p-6 shadow-2xl text-center animate-popup">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Package Created Successfully
            </h3>
            <p className="mt-2 text-gray-600">{toastMsg}</p>
          </div>
        </div>
      )}

      {showErrorToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/50 bg-white/90 backdrop-blur-xl p-6 shadow-2xl text-center animate-popup">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 8v5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="16.5" r="1" fill="currentColor" />
                <path
                  d="M10.3 3.84L1.82 18a2 2 0 001.72 3h16.92a2 2 0 001.72-3L13.7 3.84a2 2 0 00-3.4 0z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Failed to Create Package
            </h3>
            <p className="mt-2 text-gray-600">{toastMsg}</p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-sky-50 px-4 py-8 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Create Travel Package
              </h1>
              <p className="mt-2 text-gray-600 max-w-2xl">
                Add a new package with full trip details, pricing, image, and
                itinerary. Your package will be submitted for admin approval.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/agent/packages")}
              className="rounded-2xl px-5 py-3 border border-white/40 bg-white/40 backdrop-blur-md text-gray-800 shadow-sm hover:bg-white/60 transition"
            >
              Back to My Packages
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <section
              className={`${glassCard} relative z-20 p-6 sm:p-8 overflow-visible`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 7.5A2.5 2.5 0 016.5 5h11A2.5 2.5 0 0120 7.5v9A2.5 2.5 0 0117.5 19h-11A2.5 2.5 0 014 16.5v-9z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M8 9h8M8 13h5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Basic Information
                  </h2>
                  <p className="text-sm text-gray-500">
                    Enter package title, destination, category, and pricing.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5 overflow-visible relative z-20">
                <div>
                  <label className={labelClass}>Package Title</label>
                  <input
                    name="title"
                    placeholder="Package Title"
                    className={inputClass}
                    onChange={handleChange}
                    value={form.title}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Destination</label>
                  <input
                    name="destination"
                    placeholder="Destination"
                    className={inputClass}
                    onChange={handleChange}
                    value={form.destination}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Company Name</label>
                  <input
                    name="companyName"
                    placeholder="Company Name"
                    className={inputClass}
                    onChange={handleChange}
                    value={form.companyName}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Contact Number</label>
                  <input
                    name="contactNumber"
                    placeholder="Contact Number"
                    className={inputClass}
                    onChange={handleChange}
                    value={form.contactNumber}
                    required
                  />
                </div>

                <div className="relative z-[999]" ref={travelTypeRef}>
                  <label className={labelClass}>Travel Type</label>
                  <button
                    type="button"
                    onClick={() => setShowTravelTypeDropdown((prev) => !prev)}
                    className={`${inputClass} flex items-center justify-between text-left ${
                      form.travelType ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    <span>{form.travelType || "Select Travel Type"}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        showTravelTypeDropdown ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M5 7.5L10 12.5L15 7.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {showTravelTypeDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl z-[1000] max-h-72 overflow-y-auto">
                      {travelTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleTravelTypeSelect(type)}
                          className={`w-full px-4 py-3 text-left text-black transition hover:bg-blue-200 ${
                            form.travelType === type
                              ? "bg-blue-50 font-medium"
                              : ""
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Price</label>
                  <input
                    name="price"
                    type="number"
                    placeholder="Price (₹)"
                    className={inputClass}
                    onChange={handleChange}
                    value={form.price}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Days</label>
                  <input
                    name="days"
                    type="number"
                    placeholder="Days"
                    className={inputClass}
                    onChange={handleChange}
                    value={form.days}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Nights</label>
                  <input
                    name="nights"
                    type="number"
                    placeholder="Nights"
                    className={inputClass}
                    onChange={handleChange}
                    value={form.nights}
                    required
                  />
                </div>
              </div>
            </section>

            <section className={`${glassCard} relative z-0 p-6 sm:p-8`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="4"
                      y="5"
                      width="16"
                      height="14"
                      rx="2.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <circle cx="9" cy="10" r="1.5" fill="currentColor" />
                    <path
                      d="M6.5 16l4-4 2.5 2.5 2-2 2.5 3.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Package Image
                  </h2>
                  <p className="text-sm text-gray-500">
                    Upload a cover image for your package.
                  </p>
                </div>
              </div>

              <label className={labelClass}>Package Image</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImage}
                className={inputClass}
              />

              {preview && (
                <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-72 object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              )}
            </section>

            <section className={`${glassCard} relative z-0 p-6 sm:p-8`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 5h10M7 12h10M7 19h6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <circle cx="5" cy="5" r="1" fill="currentColor" />
                    <circle cx="5" cy="12" r="1" fill="currentColor" />
                    <circle cx="5" cy="19" r="1" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Package Details
                  </h2>
                  <p className="text-sm text-gray-500">
                    Add highlights, inclusions, exclusions, itinerary, and
                    description.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Highlights</label>
                  <textarea
                    name="highlights"
                    placeholder="Highlights (comma separated)"
                    className={textareaClass}
                    onChange={handleChange}
                    value={form.highlights}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Inclusions</label>
                    <textarea
                      name="inclusions"
                      placeholder="Inclusions (comma separated)"
                      className={textareaClass}
                      onChange={handleChange}
                      value={form.inclusions}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Exclusions</label>
                    <textarea
                      name="exclusions"
                      placeholder="Exclusions (comma separated)"
                      className={textareaClass}
                      onChange={handleChange}
                      value={form.exclusions}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Itinerary</label>
                  <textarea
                    name="itinerary"
                    placeholder="Itinerary (one line per day)"
                    className={`${textareaClass} min-h-[150px]`}
                    onChange={handleChange}
                    value={form.itinerary}
                  />
                </div>

                <div>
                  <label className={labelClass}>Detailed Description</label>
                  <textarea
                    name="description"
                    placeholder="Detailed Description"
                    className={`${textareaClass} min-h-[130px]`}
                    onChange={handleChange}
                    value={form.description}
                    required
                  />
                </div>
              </div>
            </section>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 rounded-2xl px-6 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-sky-500 shadow-md transition ${
                  loading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:brightness-110"
                }`}
              >
                {loading ? "Creating..." : "Create Package"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="rounded-2xl px-6 py-4 text-lg font-semibold border border-white/40 bg-white/40 backdrop-blur-md text-gray-800 shadow-sm hover:bg-white/60 transition disabled:opacity-70"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        <style>{`
          @keyframes popup {
            from {
              opacity: 0;
              transform: scale(0.96) translateY(8px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          .animate-popup {
            animation: popup 0.25s ease-out;
          }
        `}</style>
      </div>
    </>
  )
}

export default CreatePackage