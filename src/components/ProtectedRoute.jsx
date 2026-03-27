import { Navigate } from "react-router-dom"
import { useContext, useMemo } from "react"
import { AuthContext } from "../context/AuthContext"

function ProtectedRoute({ children, allowedRoles }) {
  const { role } = useContext(AuthContext)

  // ✅ If context role is empty during refresh, fallback to localStorage role
  const effectiveRole = useMemo(() => {
    if (role) return role
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "null")
      return stored?.role || ""
    } catch {
      return ""
    }
  }, [role])

  // ✅ Not logged in → always go to login (no "from" state saved)
  if (!effectiveRole) {
    return <Navigate to="/login" replace />
  }

  // Logged in but wrong role
  if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute