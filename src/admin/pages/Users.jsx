import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { AuthContext } from "../../context/AuthContext"
import {
  deleteUserAdminAPI,
  getAllUsersAdminAPI,
} from "../../services/userAPI"

function Users() {
  const { user } = useContext(AuthContext)

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [showFilter, setShowFilter] = useState(false)

  const [selectedUser, setSelectedUser] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [alertModal, setAlertModal] = useState({
    show: false,
    title: "",
    message: "",
    type: "success",
  })

  const filterRef = useRef(null)

  const token = useMemo(() => {
    if (user?.token) return user.token
    const ls = localStorage.getItem("user")
    return ls ? JSON.parse(ls)?.token : null
  }, [user?.token])

  const glassCard =
    "rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-sm shadow-black/10"

  const glassHover =
    "transition-all duration-300 hover:bg-white/75 hover:border-white/80 hover:ring-1 hover:ring-sky-200 hover:shadow-md"

  const inputClass =
    "w-full bg-white/50 backdrop-blur-md border border-white/50 rounded-2xl px-4 py-3 outline-none shadow-sm placeholder:text-gray-500 text-gray-800"

  const filterButtonClass =
    "w-full bg-white/50 backdrop-blur-md border border-white/50 rounded-2xl px-4 py-3 outline-none shadow-sm text-gray-800 flex items-center justify-between"

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()

    return users.filter((item) => {
      const matchRole = roleFilter === "all" ? true : item?.role === roleFilter

      const matchSearch =
        !q ||
        item?.name?.toLowerCase().includes(q) ||
        item?.email?.toLowerCase().includes(q) ||
        item?.phone?.toLowerCase().includes(q) ||
        item?.companyName?.toLowerCase().includes(q)

      return matchRole && matchSearch
    })
  }, [users, search, roleFilter])

  const counts = useMemo(() => {
    return {
      total: users.length,
      users: users.filter((u) => u.role === "user").length,
      agents: users.filter((u) => u.role === "agent").length,
      admins: users.filter((u) => u.role === "admin").length,
    }
  }, [users])

  const getFilterLabel = () => {
    switch (roleFilter) {
      case "user":
        return "Users"
      case "agent":
        return "Agents"
      case "admin":
        return "Admins"
      default:
        return "All roles"
    }
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700 border border-purple-200"
      case "agent":
        return "bg-sky-100 text-sky-700 border border-sky-200"
      default:
        return "bg-emerald-100 text-emerald-700 border border-emerald-200"
    }
  }

  const fetchUsers = async () => {
    try {
      if (!token) return
      setLoading(true)

      const res = await getAllUsersAdminAPI(token)
      const list = res?.data?.users || res?.data || []
      setUsers(Array.isArray(list) ? list : [])
    } catch (err) {
      console.log("GET USERS ERROR:", err)
      setAlertModal({
        show: true,
        title: "Failed",
        message: "Failed to load accounts",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [token])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const openDeleteModal = (item) => {
    setDeleteTarget(item)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    try {
      setDeleting(true)

      await deleteUserAdminAPI(deleteTarget._id, token)
      setUsers((prev) => prev.filter((item) => item._id !== deleteTarget._id))

      if (selectedUser?._id === deleteTarget._id) {
        setShowModal(false)
        setSelectedUser(null)
      }

      setDeleteTarget(null)
      setAlertModal({
        show: true,
        title: "Removed Successfully",
        message: `${deleteTarget.role} account removed successfully.`,
        type: "success",
      })
    } catch (err) {
      console.log("DELETE USER ERROR:", err)
      setDeleteTarget(null)
      setAlertModal({
        show: true,
        title: "Failed",
        message: err?.response?.data?.message || "Failed to remove account",
        type: "error",
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50">
      <section className="relative min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Manage{" "}
              <span className="bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Accounts
              </span>
            </h1>

            <p className="mt-2 text-sm sm:text-base text-gray-700 max-w-3xl">
              Search, filter, view details, and manage account access.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Accounts"
              value={counts.total}
              glassCard={glassCard}
              glassHover={glassHover}
            />
            <StatCard
              label="Users"
              value={counts.users}
              glassCard={glassCard}
              glassHover={glassHover}
            />
            <StatCard
              label="Agents"
              value={counts.agents}
              glassCard={glassCard}
              glassHover={glassHover}
            />
            <StatCard
              label="Admins"
              value={counts.admins}
              glassCard={glassCard}
              glassHover={glassHover}
            />
          </div>

          <div className={`mt-8 sm:mt-10 p-4 sm:p-5 ${glassCard}`}>
            <div>
              <h2 className="text-gray-900 font-semibold text-lg">
                Account Directory
              </h2>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, phone, company..."
                className={inputClass}
              />

              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className={filterButtonClass}
                >
                  <span>{getFilterLabel()}</span>
                  <span className="text-sm">{showFilter ? "▲" : "▼"}</span>
                </button>

                {showFilter && (
                  <div className="absolute left-0 md:left-auto md:right-0 top-full mt-2 w-full md:min-w-[190px] bg-white/95 backdrop-blur-xl border border-blue-100 rounded-2xl shadow-xl overflow-hidden z-20">
                    <button
                      onClick={() => {
                        setRoleFilter("all")
                        setShowFilter(false)
                      }}
                      className="w-full text-left px-4 py-3 text-gray-800 hover:bg-blue-200 transition"
                    >
                      All roles
                    </button>

                    <button
                      onClick={() => {
                        setRoleFilter("user")
                        setShowFilter(false)
                      }}
                      className="w-full text-left px-4 py-3 text-gray-800 hover:bg-blue-200 transition"
                    >
                      Users
                    </button>

                    <button
                      onClick={() => {
                        setRoleFilter("agent")
                        setShowFilter(false)
                      }}
                      className="w-full text-left px-4 py-3 text-gray-800 hover:bg-blue-200 transition"
                    >
                      Agents
                    </button>

                    <button
                      onClick={() => {
                        setRoleFilter("admin")
                        setShowFilter(false)
                      }}
                      className="w-full text-left px-4 py-3 text-gray-800 hover:bg-blue-200 transition"
                    >
                      Admins
                    </button>
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-gray-600 text-sm">
                Loading accounts...
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block mt-6 overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="text-left text-sm text-gray-600 border-b border-white/70">
                        <th className="py-3 pr-4">Name</th>
                        <th className="py-3 pr-4">Email</th>
                        <th className="py-3 pr-4">Role</th>
                        <th className="py-3 pr-4">Company</th>
                        <th className="py-3 pr-4">Phone</th>
                        <th className="py-3 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((item) => (
                        <tr
                          key={item._id}
                          className="border-b border-white/50 text-sm text-gray-800"
                        >
                          <td className="py-4 pr-4 font-medium">{item.name}</td>
                          <td className="py-4 pr-4 break-all">{item.email}</td>
                          <td className="py-4 pr-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getRoleBadge(
                                item.role
                              )}`}
                            >
                              {item.role}
                            </span>
                          </td>
                          <td className="py-4 pr-4">
                            {item.companyName || "-"}
                          </td>
                          <td className="py-4 pr-4">{item.phone || "-"}</td>
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => {
                                  setSelectedUser(item)
                                  setShowModal(true)
                                }}
                                className="px-3 py-2 rounded-xl bg-white text-gray-800 border border-gray-200 text-xs font-medium hover:bg-gray-50 transition"
                              >
                                View Details
                              </button>

                              {item.role !== "admin" && (
                                <button
                                  onClick={() => openDeleteModal(item)}
                                  className="px-3 py-2 rounded-xl bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}

                      {filteredUsers.length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="py-8 text-center text-gray-600 text-sm"
                          >
                            No accounts found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile + Tablet Cards */}
                <div className="lg:hidden mt-6 space-y-4">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((item) => (
                      <div
                        key={item._id}
                        className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur-md p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 break-words">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-sm text-gray-600 break-all">
                              {item.email}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold capitalize ${getRoleBadge(
                              item.role
                            )}`}
                          >
                            {item.role}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <InfoBox
                            label="Company"
                            value={item.companyName || "-"}
                          />
                          <InfoBox label="Phone" value={item.phone || "-"} />
                        </div>

                        <div className="mt-4 flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(item)
                              setShowModal(true)
                            }}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white text-gray-800 border border-gray-200 text-sm font-medium hover:bg-gray-50 transition"
                          >
                            View Details
                          </button>

                          {item.role !== "admin" && (
                            <button
                              onClick={() => openDeleteModal(item)}
                              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-gray-600 text-sm">
                      No accounts found
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {showModal && selectedUser && (
        <DetailsModal
          title="Account Details"
          onClose={() => {
            setShowModal(false)
            setSelectedUser(null)
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <DetailItem label="Name" value={selectedUser.name} />
            <DetailItem label="Email" value={selectedUser.email} />
            <DetailItem
              label="Role"
              value={
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${getRoleBadge(
                    selectedUser.role
                  )}`}
                >
                  {selectedUser.role}
                </span>
              }
            />
            <DetailItem label="Phone" value={selectedUser.phone || "-"} />
            <DetailItem
              label="Company"
              value={selectedUser.companyName || "-"}
            />
            <DetailItem label="Address" value={selectedUser.address || "-"} />
            <DetailItem label="Age" value={selectedUser.age ?? "-"} />
            <DetailItem label="Gender" value={selectedUser.gender || "-"} />
            <DetailItem
              label="Blood Group"
              value={selectedUser.bloodGroup || "-"}
            />
            <DetailItem
              label="Nationality"
              value={selectedUser.nationality || "-"}
            />
            <DetailItem label="State" value={selectedUser.state || "-"} />
            <DetailItem
              label="Emergency Contact"
              value={selectedUser.emergencyContact || "-"}
            />
          </div>
        </DetailsModal>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Remove Account"
          message={`Are you sure you want to remove this ${deleteTarget.role}?`}
          confirmText={deleting ? "Removing..." : "Remove"}
          onCancel={() => {
            if (!deleting) setDeleteTarget(null)
          }}
          onConfirm={confirmDelete}
          danger
          loading={deleting}
        />
      )}

      {alertModal.show && (
        <AlertModal
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
          onClose={() =>
            setAlertModal({
              show: false,
              title: "",
              message: "",
              type: "success",
            })
          }
        />
      )}
    </div>
  )
}

function StatCard({ label, value, glassCard, glassHover }) {
  return (
    <div className={`p-4 ${glassCard} ${glassHover}`}>
      <div className="text-xs sm:text-sm text-gray-700">{label}</div>
      <div className="mt-1 text-xl sm:text-2xl font-bold text-gray-900">
        {value}
      </div>
    </div>
  )
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-gray-900 break-words">
        {value}
      </div>
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-sm sm:text-base text-gray-900 font-medium break-words">
        {value}
      </div>
    </div>
  )
}

function DetailsModal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/70 bg-white backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  )
}

function ConfirmModal({
  title,
  message,
  onCancel,
  onConfirm,
  confirmText,
  danger = false,
  loading = false,
}) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white shadow-2xl">
        <div className="p-5 sm:p-6 text-center">
          <div
            className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center text-2xl border ${
              danger
                ? "bg-red-50 text-red-500 border-red-100"
                : "bg-blue-50 text-blue-500 border-blue-100"
            }`}
          >
            {danger ? "!" : "i"}
          </div>

          <h3 className="mt-4 text-xl sm:text-2xl font-bold text-gray-900">
            {title}
          </h3>
          <p className="mt-2 text-sm sm:text-base text-gray-600">{message}</p>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="w-full flex-1 rounded-2xl border border-gray-200 bg-white text-gray-700 font-semibold py-3 hover:bg-gray-50 transition disabled:opacity-70"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`w-full flex-1 rounded-2xl text-white font-semibold py-3 transition disabled:opacity-70 ${
                danger
                  ? "bg-gradient-to-r from-red-500 to-rose-500 hover:brightness-110"
                  : "bg-gradient-to-r from-blue-500 to-sky-500 hover:brightness-110"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AlertModal({ title, message, onClose, type = "success" }) {
  const isError = type === "error"

  return (
    <div className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white shadow-2xl">
        <div className="p-5 sm:p-6 text-center">
          <div
            className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center text-2xl border ${
              isError
                ? "bg-red-50 text-red-500 border-red-100"
                : "bg-green-50 text-green-500 border-green-100"
            }`}
          >
            {isError ? "✕" : "✓"}
          </div>

          <h3 className="mt-4 text-xl sm:text-2xl font-bold text-gray-900">
            {title}
          </h3>
          <p className="mt-2 text-sm sm:text-base text-gray-600">{message}</p>

          <button
            type="button"
            onClick={onClose}
            className={`mt-6 w-full rounded-2xl text-white font-semibold py-3 transition ${
              isError
                ? "bg-gradient-to-r from-red-500 to-rose-500 hover:brightness-110"
                : "bg-gradient-to-r from-green-500 to-emerald-500 hover:brightness-110"
            }`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

export default Users