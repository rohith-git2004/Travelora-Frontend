import { useEffect, useMemo, useRef, useState } from "react"
import {
  getAllPackagesAdminAPI,
  updatePackageStatusAPI,
} from "../../services/adminAPI"
import serverURL from "../../services/serverURL"

function AdminPackages() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [updatingId, setUpdatingId] = useState("")
  const [showFilter, setShowFilter] = useState(false)

  const filterRef = useRef(null)

  const token = JSON.parse(localStorage.getItem("user"))?.token

  const glass =
    "bg-white/30 backdrop-blur-md border border-white/40 rounded-2xl shadow-sm"

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const res = await getAllPackagesAdminAPI(token)

      if (res.status === 200) {
        setPackages(res.data || [])
      } else {
        alert("Failed to load packages")
      }
    } catch (error) {
      console.log(error)
      alert("Failed to load packages")
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id)
      const res = await updatePackageStatusAPI(id, status, token)

      if (res.status === 200) {
        const updatedPackages = packages.map((pkg) =>
          pkg._id === id ? { ...pkg, status } : pkg
        )
        setPackages(updatedPackages)

        if (selectedPackage?._id === id) {
          setSelectedPackage((prev) => ({ ...prev, status }))
        }
      } else {
        alert("Status update failed")
      }
    } catch (error) {
      console.log(error)
      alert("Status update failed")
    } finally {
      setUpdatingId("")
    }
  }

  const openDetailsModal = (pkg) => {
    setSelectedPackage(pkg)
    setShowDetailsModal(true)
  }

  const closeDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedPackage(null)
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const q = search.toLowerCase()

      const matchesSearch =
        pkg.title?.toLowerCase().includes(q) ||
        pkg.destination?.toLowerCase().includes(q) ||
        pkg.description?.toLowerCase().includes(q)

      let matchesStatus = true

      if (statusFilter === "approved") {
        matchesStatus = pkg.status === "approved"
      } else if (statusFilter === "rejected") {
        matchesStatus = pkg.status === "rejected"
      } else if (statusFilter === "pending") {
        matchesStatus =
          pkg.status === "pending" || pkg.status === "editedPending"
      } else if (statusFilter === "updated") {
        matchesStatus = pkg.status === "editedPending"
      }

      return matchesSearch && matchesStatus
    })
  }, [packages, search, statusFilter])

  const getDisplayStatus = (status) => {
    if (status === "editedPending") return "pending"
    return status || "unknown"
  }

  const getStatusClasses = (status) => {
    const displayStatus = getDisplayStatus(status)

    switch ((displayStatus || "").toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-700 border border-green-200"
      case "rejected":
        return "bg-red-100 text-red-700 border border-red-200"
      case "pending":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200"
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200"
    }
  }

  const getStatusLabel = (status) => {
    const displayStatus = getDisplayStatus(status)

    switch ((displayStatus || "").toLowerCase()) {
      case "approved":
        return "Approved"
      case "rejected":
        return "Rejected"
      case "pending":
        return "Pending"
      default:
        return "Unknown"
    }
  }

  const getFilterLabel = () => {
    switch (statusFilter) {
      case "approved":
        return "Approved"
      case "rejected":
        return "Rejected"
      case "pending":
        return "Pending"
      case "updated":
        return "Updated Packages"
      default:
        return "All Status"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-sky-50 p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Manage Packages
        </h1>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className={`flex-1 ${glass} px-4 py-3`}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by package name, destination or description..."
            className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-500"
          />
        </div>

        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`${glass} px-4 py-3 min-w-[190px] text-left text-gray-800 font-medium flex items-center justify-between`}
          >
            <span>{getFilterLabel()}</span>
            <span className="text-sm">{showFilter ? "▲" : "▼"}</span>
          </button>

          {showFilter && (
            <div className="absolute right-0 mt-2 min-w-[190px] bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl overflow-hidden z-20">
              <button
                onClick={() => {
                  setStatusFilter("all")
                  setShowFilter(false)
                }}
                className="w-full text-left px-4 py-3 text-gray-800 hover:bg-blue-200 transition"
              >
                All Status
              </button>

              <button
                onClick={() => {
                  setStatusFilter("approved")
                  setShowFilter(false)
                }}
                className="w-full text-left px-4 py-3 text-gray-800 hover:bg-blue-200 transition"
              >
                Approved
              </button>

              <button
                onClick={() => {
                  setStatusFilter("rejected")
                  setShowFilter(false)
                }}
                className="w-full text-left px-4 py-3 text-gray-800 hover:bg-blue-200 transition"
              >
                Rejected
              </button>

              <button
                onClick={() => {
                  setStatusFilter("pending")
                  setShowFilter(false)
                }}
                className="w-full text-left px-4 py-3 text-gray-800 hover:bg-blue-200 transition"
              >
                Pending
              </button>

              <button
                onClick={() => {
                  setStatusFilter("updated")
                  setShowFilter(false)
                }}
                className="w-full text-left px-4 py-3 text-gray-800 hover:bg-blue-200 transition"
              >
                Updated Packages
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-5">
        {loading ? (
          <div className={`${glass} p-6 text-gray-700`}>Loading packages...</div>
        ) : filteredPackages.length > 0 ? (
          filteredPackages.map((pkg) => (
            <div
              key={pkg._id}
              className="group bg-white border border-gray-200 rounded-2xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-72 w-full h-56 bg-gray-100 overflow-hidden">
                  {pkg.image ? (
                    <img
                      src={`${serverURL}/uploads/${pkg.image}`}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex-1 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {pkg.title}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {pkg.destination || "Destination not added"}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize w-fit ${getStatusClasses(
                        pkg.status
                      )}`}
                    >
                      {getStatusLabel(pkg.status)}
                    </span>
                  </div>

                  <p className="text-gray-600 mt-3 line-clamp-3">
                    {pkg.description || "No description available"}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-700">
                    <p>
                      <span className="font-semibold text-gray-900">Price:</span>{" "}
                      ₹{pkg.price || 0}
                    </p>

                    {pkg.days && (
                      <p>
                        <span className="font-semibold text-gray-900">Days:</span>{" "}
                        {pkg.days}
                      </p>
                    )}

                    {pkg.nights && (
                      <p>
                        <span className="font-semibold text-gray-900">Nights:</span>{" "}
                        {pkg.nights}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      onClick={() => openDetailsModal(pkg)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 text-white hover:brightness-110 transition"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => updateStatus(pkg._id, "approved")}
                      disabled={updatingId === pkg._id}
                      className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-60"
                    >
                      {updatingId === pkg._id ? "Updating..." : "Approve"}
                    </button>

                    <button
                      onClick={() => updateStatus(pkg._id, "rejected")}
                      disabled={updatingId === pkg._id}
                      className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
                    >
                      {updatingId === pkg._id ? "Updating..." : "Reject"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={`${glass} p-6 text-gray-700`}>No packages found.</div>
        )}
      </div>

      {showDetailsModal && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white/85 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl">
            <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-200 rounded-t-3xl px-5 sm:px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Package Details
              </h2>
              <button
                onClick={closeDetailsModal}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-lg font-bold transition"
              >
                ×
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5 text-sm text-gray-700">
              {selectedPackage.image && (
                <img
                  src={`${serverURL}/uploads/${selectedPackage.image}`}
                  alt={selectedPackage.title}
                  className="w-full h-64 sm:h-80 object-cover rounded-2xl border border-gray-200"
                />
              )}

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedPackage.title}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {selectedPackage.destination || "Destination not added"}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize w-fit ${getStatusClasses(
                    selectedPackage.status
                  )}`}
                >
                  {getStatusLabel(selectedPackage.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                  <p className="text-gray-500 text-xs mb-1">Price</p>
                  <p className="font-bold text-gray-900">
                    ₹{selectedPackage.price || 0}
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                  <p className="text-gray-500 text-xs mb-1">Days</p>
                  <p className="font-bold text-gray-900">
                    {selectedPackage.days || "-"}
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                  <p className="text-gray-500 text-xs mb-1">Nights</p>
                  <p className="font-bold text-gray-900">
                    {selectedPackage.nights || "-"}
                  </p>
                </div>
              </div>

              {selectedPackage.description && (
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Description</p>
                  <p className="text-gray-600 leading-7">
                    {selectedPackage.description}
                  </p>
                </div>
              )}

              {selectedPackage.highlights && (
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Highlights</p>

                  {Array.isArray(selectedPackage.highlights) ? (
                    <div className="space-y-2">
                      {selectedPackage.highlights.map((item, index) => (
                        <div
                          key={item._id || index}
                          className="bg-gray-50 border border-gray-200 rounded-2xl p-3"
                        >
                          <p className="text-gray-600 leading-7">
                            {typeof item === "object"
                              ? item.title || item.name || item.details || JSON.stringify(item)
                              : item}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 leading-7 whitespace-pre-line">
                      {selectedPackage.highlights}
                    </p>
                  )}
                </div>
              )}

              {selectedPackage.inclusions && (
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Inclusions</p>

                  {Array.isArray(selectedPackage.inclusions) ? (
                    <div className="space-y-2">
                      {selectedPackage.inclusions.map((item, index) => (
                        <div
                          key={item._id || index}
                          className="bg-gray-50 border border-gray-200 rounded-2xl p-3"
                        >
                          <p className="text-gray-600 leading-7">
                            {typeof item === "object"
                              ? item.title || item.name || item.details || JSON.stringify(item)
                              : item}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 leading-7 whitespace-pre-line">
                      {selectedPackage.inclusions}
                    </p>
                  )}
                </div>
              )}

              {selectedPackage.exclusions && (
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Exclusions</p>

                  {Array.isArray(selectedPackage.exclusions) ? (
                    <div className="space-y-2">
                      {selectedPackage.exclusions.map((item, index) => (
                        <div
                          key={item._id || index}
                          className="bg-gray-50 border border-gray-200 rounded-2xl p-3"
                        >
                          <p className="text-gray-600 leading-7">
                            {typeof item === "object"
                              ? item.title || item.name || item.details || JSON.stringify(item)
                              : item}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 leading-7 whitespace-pre-line">
                      {selectedPackage.exclusions}
                    </p>
                  )}
                </div>
              )}

              {selectedPackage.itinerary && (
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Itinerary</p>

                  {Array.isArray(selectedPackage.itinerary) ? (
                    <div className="space-y-3">
                      {selectedPackage.itinerary.map((item, index) => (
                        <div
                          key={item._id || index}
                          className="bg-gray-50 border border-gray-200 rounded-2xl p-4"
                        >
                          <p className="font-semibold text-gray-900 mb-1">
                            {item.day || `Day ${index + 1}`}
                          </p>
                          <p className="text-gray-600 leading-7">
                            {item.details}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 leading-7 whitespace-pre-line">
                      {selectedPackage.itinerary}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPackages