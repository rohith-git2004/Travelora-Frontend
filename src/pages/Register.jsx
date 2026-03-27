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

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
      {successMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-xs sm:max-w-sm rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-white/60 px-5 py-6 sm:px-8 sm:py-10 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl text-green-600">✓</span>
            </div>

            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
              Success
            </h2>

            <p className="text-gray-600 text-xs sm:text-sm font-medium">
              {successMsg}
            </p>
          </div>
        </div>
      )}

      <img
        src="https://images.unsplash.com/photo-1526779259212-939e64788e3c?auto=format&fit=crop&w=2000&q=80"
        alt="travel"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-md p-8 rounded-[30px] bg-white/20 backdrop-blur-2xl border border-white/40 shadow-[0_20px_80px_rgba(0,0,0,0.3)]">
        <h1 className="text-3xl font-semibold text-center text-white mb-2">
          Travelora
        </h1>

        <p className="text-center text-white/80 text-sm mb-6">
          Create your account
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          {errorMsg && (
            <div className="bg-red-500/20 border border-red-400/40 text-white text-sm px-4 py-3 rounded-xl">
              {errorMsg}
            </div>
          )}

          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/30 border border-white/40 text-white"
          />

          <input
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/30 border border-white/40 text-white"
          />

          <input
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-white/30 border border-white/40 text-white"
          />

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 pr-10 rounded-xl bg-white/30 border border-white/40 text-white"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
            >
              {showPassword ? (
                // SAME AS LOGIN
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3l18 18M10.5 10.5a2 2 0 002.8 2.8M6.5 6.5C4.5 8 3 12 3 12s3.5 6 9.5 6c1.5 0 2.9-.3 4.1-.8M17.5 17.5C19.5 16 21 12 21 12s-3.5-6-9.5-6c-1.5 0-2.9.3-4.1.8"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"
                  />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 pr-10 rounded-xl bg-white/30 border border-white/40 text-white"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
            >
              {showConfirmPassword ? (
                // SAME AS LOGIN
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path d="M3 3l18 18M10.5 10.5a2 2 0 002.8 2.8M6.5 6.5C4.5 8 3 12 3 12s3.5 6 9.5 6c1.5 0 2.9-.3 4.1-.8M17.5 17.5C19.5 16 21 12 21 12s-3.5-6-9.5-6c-1.5 0-2.9.3-4.1.8" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-medium ${
              loading
                ? "bg-white/30 text-white/60"
                : "bg-white text-black"
            }`}
          >
            {loading ? "Creating..." : "Register"}
          </button>
          <p className="text-center text-sm text-white/80">
            Already have an account?{" "}
            <Link to="/login" className="underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register