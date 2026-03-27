import { useContext, useMemo, useState } from "react"
import { AuthContext } from "../../context/AuthContext"
import { createAgentAPI, createAdminAPI } from "../../services/userAPI"

function CreateAgent() {
  const { user } = useContext(AuthContext)

  const [activeRole, setActiveRole] = useState("agent")
  const [creating, setCreating] = useState(false)

  const [modalData, setModalData] = useState({
    show: false,
    title: "",
    message: "",
    type: "success",
  })

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    companyName: "",
  })

  const token = useMemo(() => {
    if (user?.token) return user.token
    const ls = localStorage.getItem("user")
    return ls ? JSON.parse(ls)?.token : null
  }, [user?.token])

  const glassCard =
    "rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-sm shadow-black/10"

  const inputClass =
    "w-full bg-white/40 backdrop-blur-md border border-white/40 rounded-2xl px-4 py-3 outline-none shadow-sm placeholder:text-gray-500 text-gray-800"

  const primaryButton =
    "px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white font-medium hover:brightness-110 transition disabled:opacity-70 disabled:cursor-not-allowed"

  const toggleActive =
    "px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white font-medium transition"

  const toggleInactive =
    "px-4 py-3 rounded-2xl bg-white/70 border border-white/70 text-gray-800 font-medium hover:bg-white transition"

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      companyName: "",
    })
  }

  const closeModal = () => {
    setModalData({
      show: false,
      title: "",
      message: "",
      type: "success",
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCreating(true)

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        companyName: activeRole === "agent" ? formData.companyName : "",
      }

      if (activeRole === "agent") {
        await createAgentAPI(payload, token)
        setModalData({
          show: true,
          title: "Success",
          message: "Agent created successfully",
          type: "success",
        })
      } else {
        await createAdminAPI(payload, token)
        setModalData({
          show: true,
          title: "Success",
          message: "Admin created successfully",
          type: "success",
        })
      }

      resetForm()
    } catch (err) {
      console.log("CREATE ACCOUNT ERROR:", err)
      setModalData({
        show: true,
        title: "Failed",
        message: err?.response?.data?.message || "Failed to create account",
        type: "error",
      })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50">
      <section className="relative min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Create{" "}
              <span className="bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Agent / Admin
              </span>
            </h1>

            <p className="mt-2 text-gray-700 max-w-2xl">
              Create secure role-based access for Travelora management.
            </p>
          </div>

          <div className={`mt-10 p-6 ${glassCard}`}>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setActiveRole("agent")}
                className={activeRole === "agent" ? toggleActive : toggleInactive}
              >
                Create Agent
              </button>

              <button
                type="button"
                onClick={() => setActiveRole("admin")}
                className={activeRole === "admin" ? toggleActive : toggleInactive}
              >
                Create Admin
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  className={inputClass}
                  required
                />

                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  className={inputClass}
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className={inputClass}
                  required
                />

                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  className={inputClass}
                />
              </div>

              {activeRole === "agent" && (
                <input
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Company name"
                  className={inputClass}
                  required
                />
              )}

              <button
                type="submit"
                disabled={creating}
                className={`${primaryButton} w-full sm:w-auto`}
              >
                {creating
                  ? "Creating..."
                  : activeRole === "agent"
                  ? "Create Agent"
                  : "Create Admin"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {modalData.show && (
        <StatusModal
          title={modalData.title}
          message={modalData.message}
          type={modalData.type}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

function StatusModal({ title, message, type, onClose }) {
  const isError = type === "error"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white shadow-2xl p-6 text-center">
        <div
          className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center text-2xl border ${
            isError
              ? "bg-red-50 text-red-500 border-red-100"
              : "bg-green-50 text-green-500 border-green-100"
          }`}
        >
          {isError ? "✕" : "✓"}
        </div>

        <h3 className="mt-4 text-2xl font-bold text-gray-900">{title}</h3>

        <p className="mt-2 text-gray-600">{message}</p>

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
  )
}

export default CreateAgent