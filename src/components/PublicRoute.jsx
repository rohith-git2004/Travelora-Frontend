import { Navigate } from "react-router-dom"
import { useContext, useMemo } from "react"
import { AuthContext } from "../context/AuthContext"

function PublicRoute({ children }) {
  const { role } = useContext(AuthContext)

  // ✅ fallback role on refresh
  const effectiveRole = useMemo(() => {
    if (role) return role
    try {
      const savedRole = localStorage.getItem("role")
      const savedUser = JSON.parse(localStorage.getItem("user") || "null")
      return savedRole || savedUser?.role || ""
    } catch {
      return ""
    }
  }, [role])

  // ✅ If already logged in, always go to default home per role
  if (effectiveRole === "user") {
    return <Navigate to="/user/packages" replace />
  }
  if (effectiveRole === "agent") {
    return <Navigate to="/agent/dashboard" replace />
  }
  if (effectiveRole === "admin") {
    return <Navigate to="/admin/dashboard" replace />
  }

  return children
}

export default PublicRoute