import { useState, useContext } from "react"
import { loginAPI } from "../services/authAPI"
import { AuthContext } from "../context/AuthContext"
import { Link, useNavigate } from "react-router-dom"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")

    try {
      const res = await loginAPI({
        email: email.trim(),
        password,
      })

      if (!res.data.success) {
        setErrorMsg(res.data.message)
        setLoading(false)
        return
      }

      login(res.data, res.data.role)

      if (res.data.role === "user") navigate("/user/packages", { replace: true })
      else if (res.data.role === "agent") navigate("/agent/dashboard", { replace: true })
      else navigate("/admin/dashboard", { replace: true })
    } catch {
      setErrorMsg("Server error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 py-6 sm:py-8">
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1526779259212-939e64788e3c?auto=format&fit=crop&w=2000&q=80"
        alt="travel"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      {/* Glass Card */}
      <div
        className="
          relative z-10 w-full max-w-md
          p-5 sm:p-6 md:p-8
          rounded-2xl sm:rounded-[30px]
          bg-white/20 backdrop-blur-2xl
          border border-white/40
          shadow-[0_20px_80px_rgba(0,0,0,0.3)]
        "
      >
        {/* Shine line */}
        <div className="absolute inset-x-6 sm:inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>

        <h1 className="text-2xl sm:text-3xl font-semibold text-center text-white mb-2">
          Travelora
        </h1>

        <p className="text-center text-white/80 text-xs sm:text-sm mb-6 sm:mb-8">
          Start your journey with us
        </p>

        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
          {errorMsg && (
            <div className="bg-red-500/20 border border-red-400/40 text-white text-sm px-4 py-3 rounded-xl backdrop-blur-md break-words">
              {errorMsg}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="text-sm text-white font-medium">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="
                mt-2 w-full px-4 py-3
                text-sm sm:text-base
                rounded-xl
                bg-white/30 border border-white/40
                text-white placeholder:text-white/70
                outline-none backdrop-blur-xl
                focus:ring-2 focus:ring-white/60
              "
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-white font-medium">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="
                mt-2 w-full px-4 py-3
                text-sm sm:text-base
                rounded-xl
                bg-white/30 border border-white/40
                text-white placeholder:text-white/70
                outline-none backdrop-blur-xl
                focus:ring-2 focus:ring-white/60
              "
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-medium text-sm sm:text-base transition ${
              loading
                ? "bg-white/30 text-white/60 cursor-not-allowed"
                : "bg-white text-black hover:opacity-90"
            }`}
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          <p className="text-center text-xs sm:text-sm text-white/80 leading-relaxed">
            Don’t have an account?{" "}
            <Link to="/register" className="text-white font-semibold underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login