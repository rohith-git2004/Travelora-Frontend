import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  getAgentPackagesAPI,
  deleteAgentPackageAPI,
} from "../../services/agentAPI"
import serverURL from "../../services/serverURL"

function MyPackages() {
  const navigate = useNavigate()

  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showFilter, setShowFilter] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const filterRef = useRef(null)

  const token = useMemo(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"))
    return storedUser?.token || null
  }, [])

  const glass =
    "bg-white/30 backdrop-blur-md border border-white/40 rounded-2xl shadow-sm"

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const result = await getAgentPackagesAPI(token)
      setPackages(result?.data || [])
    } catch (error) {
      console.log("GET AGENT PACKAGES ERROR:", error)
      setPackages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchPackages()
    }
  }, [token])

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  const openDeleteModal = (pkg) => {
    setSelectedPackage(pkg)
    setDeleteSuccess(false)
    setErrorMessage("")
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    if (deleting) return
    setShowDeleteModal(false)
    setSelectedPackage(null)
    setDeleteSuccess(false)
    setErrorMessage("")
  }

  const handleDeletePackage = async () => {
    if (!selectedPackage?._id) return

    try {
      setDeleting(true)
      setErrorMessage("")

      const result = await deleteAgentPackageAPI(selectedPackage._id, token)

      if (result?.status >= 200 && result?.status < 300) {
        setPackages((prev) =>
          prev.filter((pkg) => pkg._id !== selectedPackage._id)
        )

        setDeleteSuccess(true)

        setTimeout(() => {
          setShowDeleteModal(false)
          setSelectedPackage(null)
          setDeleteSuccess(false)
        }, 2000)
      } else {
        setErrorMessage(result?.data?.message || "Failed to delete package")
      }
    } catch (error) {
      console.log("DELETE PACKAGE ERROR:", error)
      setErrorMessage(
        error?.response?.data?.message || "Something went wrong while deleting"
      )
    } finally {
      setDeleting(false)
    }
  }

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const q = search.trim().toLowerCase()

      const matchesSearch =
        pkg?.title?.toLowerCase().includes(q) ||
        pkg?.destination?.toLowerCase().includes(q) ||
        pkg?.travelType?.toLowerCase().includes(q)

      let matchesStatus = true

      if (statusFilter === "approved") {
        matchesStatus = pkg?.status === "approved"
      } else if (statusFilter === "pending") {
        matchesStatus =
          pkg?.status === "pending" || pkg?.status === "editedPending"
      } else if (statusFilter === "rejected") {
        matchesStatus = pkg?.status === "rejected"
      } else if (statusFilter === "updatedPackage") {
        matchesStatus =
          pkg?.status === "editedPending" || pkg?.isUpdated === true
      }

      return matchesSearch && matchesStatus
    })
  }, [packages, search, statusFilter])

  const getStatusLabel = (status) => {
    if (status === "approved") return "Approved"
    if (status === "rejected") return "Rejected"
    if (status === "pending" || status === "editedPending") return "Pending"
    return "Unknown"
  }

  const getStatusClass = (status) => {
    if (status === "approved") {
      return "bg-green-100 text-green-700 border border-green-200"
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700 border border-red-200"
    }

    if (status === "pending" || status === "editedPending") {
      return "bg-yellow-100 text-yellow-700 border border-yellow-200"
    }

    return "bg-gray-100 text-gray-600 border border-gray-200"
  }

  const getFilterLabel = () => {
    if (statusFilter === "approved") return "Approved"
    if (statusFilter === "pending") return "Pending"
    if (statusFilter === "rejected") return "Rejected"
    if (statusFilter === "updatedPackage") return "Updated Packages"
    return "All Packages"
  }

  const filterOptions = [
    { label: "All Packages", value: "all" },
    { label: "Approved", value: "approved" },
    { label: "Pending", value: "pending" },
    { label: "Rejected", value: "rejected" },
    { label: "Updated Packages", value: "updatedPackage" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-sky-50 px-4 py-8 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              My Packages
            </h1>
            <p className="mt-2 text-gray-600">
              Manage, update, and delete your travel packages
            </p>
          </div>

          <button
            onClick={() => navigate("/agent/create")}
            className="bg-gradient-to-r from-blue-500 to-sky-500 text-white hover:brightness-110 rounded-2xl px-5 py-3 shadow-sm font-medium transition"
          >
            + Add Package
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Search by title, destination, or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`flex-1 px-4 py-3 outline-none placeholder:text-gray-500 ${glass}`}
          />

          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setShowFilter((prev) => !prev)}
              className={`min-w-[210px] px-4 py-3 text-left text-gray-700 flex items-center justify-between ${glass}`}
            >
              <span>{getFilterLabel()}</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  showFilter ? "rotate-180" : ""
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

            {showFilter && (
              <div className="absolute right-0 mt-2 w-full min-w-[210px] bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden z-20">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setStatusFilter(option.value)
                      setShowFilter(false)
                    }}
                    className={`w-full px-4 py-3 text-left text-gray-700 transition hover:bg-blue-100 hover:text-blue-600 ${
                      statusFilter === option.value
                        ? "bg-blue-50 font-medium text-blue-600"
                        : ""
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className={`${glass} p-10 text-center text-gray-600`}>
            Loading packages...
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className={`${glass} p-10 text-center text-gray-600`}>
            No packages found
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg._id}
                className="group bg-white border border-gray-200 rounded-2xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="relative h-56 overflow-hidden bg-gray-100">
                  {pkg?.image ? (
                    <img
                      src={`${serverURL}/uploads/${pkg.image}`}
                      alt={pkg.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 line-clamp-1">
                        {pkg?.title}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {pkg?.destination}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                        pkg?.status
                      )}`}
                    >
                      {getStatusLabel(pkg?.status)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium text-gray-800">Type:</span>{" "}
                      {pkg?.travelType}
                    </p>
                    <p>
                      <span className="font-medium text-gray-800">Price:</span>{" "}
                      ₹{Number(pkg?.price || 0).toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium text-gray-800">
                        Duration:
                      </span>{" "}
                      {pkg?.days} Days / {pkg?.nights} Nights
                    </p>
                    {pkg?.companyName && (
                      <p>
                        <span className="font-medium text-gray-800">
                          Company:
                        </span>{" "}
                        {pkg.companyName}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => navigate(`/agent/update/${pkg._id}`)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-sky-500 text-white hover:brightness-110 rounded-2xl px-4 py-3 font-medium transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => openDeleteModal(pkg)}
                      className="flex-1 bg-red-500 text-white hover:bg-red-600 rounded-2xl px-4 py-3 font-medium transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-3xl border border-white/50 bg-white/80 backdrop-blur-xl shadow-2xl p-6">
              {deleteSuccess ? (
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-8 w-8 text-green-600"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M5 12L10 17L19 8"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900">
                    Package Deleted
                  </h2>

                  <p className="mt-3 text-gray-600">
                    Package deleted successfully
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Delete Package
                  </h2>

                  <p className="mt-3 text-gray-600 leading-relaxed">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-gray-900">
                      {selectedPackage?.title}
                    </span>
                    ? This action cannot be undone.
                  </p>

                  {errorMessage && (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {errorMessage}
                    </div>
                  )}

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={closeDeleteModal}
                      disabled={deleting}
                      className="flex-1 rounded-2xl border border-gray-300 bg-white text-gray-700 px-4 py-3 font-medium hover:bg-gray-50 transition disabled:opacity-60"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleDeletePackage}
                      disabled={deleting}
                      className="flex-1 rounded-2xl bg-red-500 text-white px-4 py-3 font-medium hover:bg-red-600 transition disabled:opacity-60"
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyPackages