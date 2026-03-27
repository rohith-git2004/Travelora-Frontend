import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { registerUserAPI } from "../services/authAPI"

function Register() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    const { name, email, phone, password, confirmPassword } = formData

    if (!name || !email || !phone || !password || !confirmPassword) {
      setErrorMsg("Please fill all fields")
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match")
      return
    }

    try {
      setLoading(true)
      setErrorMsg("")

      const result = await registerUserAPI({ name, email, password, phone })

      if (result.status === 201) {
        setSuccessMsg("Registration successful")

        setTimeout(() => {
          setSuccessMsg("")
          navigate("/login", { replace: true })
        }, 1500)
      } else {
        setErrorMsg(result.data?.message || "Registration failed")
      }
    } catch {
      setErrorMsg("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-10">
      {/* SUCCESS CENTER MODAL */}
      {successMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl border border-white/60 px-8 py-10 text-center animate-[fadeIn_.3s_ease]">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-3xl text-green-600">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Success
            </h2>
            <p className="text-gray-600 text-sm font-medium">{successMsg}</p>
          </div>
        </div>
      )}

      {/* BACKGROUND */}
      <img
        src="https://images.unsplash.com/photo-1526779259212-939e64788e3c?auto=format&fit=crop&w=2000&q=80"
        alt="travel"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      {/* CARD */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-[30px] bg-white/20 backdrop-blur-2xl border border-white/40 shadow-[0_20px_80px_rgba(0,0,0,0.3)]">
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>

        <h1 className="text-3xl font-semibold text-center text-white mb-2">
          Travelora
        </h1>

        <p className="text-center text-white/80 text-sm mb-6">
          Create your account to start booking
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          {errorMsg && (
            <div className="bg-red-500/20 border border-red-400/40 text-white text-sm px-4 py-3 rounded-xl backdrop-blur-md">
              {errorMsg}
            </div>
          )}

          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/30 border border-white/40 text-white placeholder:text-white/70 outline-none backdrop-blur-xl focus:ring-2 focus:ring-white/60"
          />

          <input
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/30 border border-white/40 text-white placeholder:text-white/70 outline-none backdrop-blur-xl focus:ring-2 focus:ring-white/60"
          />

          <input
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/30 border border-white/40 text-white placeholder:text-white/70 outline-none backdrop-blur-xl focus:ring-2 focus:ring-white/60"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/30 border border-white/40 text-white placeholder:text-white/70 outline-none backdrop-blur-xl focus:ring-2 focus:ring-white/60"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/30 border border-white/40 text-white placeholder:text-white/70 outline-none backdrop-blur-xl focus:ring-2 focus:ring-white/60"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-medium transition ${
              loading
                ? "bg-white/30 text-white/60 cursor-not-allowed"
                : "bg-white text-black hover:opacity-90"
            }`}
          >
            {loading ? "Creating..." : "Register"}
          </button>

          <p className="text-center text-sm text-white/80">
            Already have an account?{" "}
            <Link to="/login" className="text-white font-semibold underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register