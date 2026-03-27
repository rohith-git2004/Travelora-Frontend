import { createContext, useState, useEffect } from "react"
import { getUserProfileAPI } from "../services/userAPI"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)

  // ✅ helper: pull full profile and merge into user (keeps token/role)
  const hydrateUserProfile = async (baseUser) => {
    try {
      if (!baseUser?.token) return baseUser

      const reqHeader = { Authorization: `Bearer ${baseUser.token}` }
      const res = await getUserProfileAPI(reqHeader)
      const fullUser = res.data?.user || res.data

      // ✅ keep token + role from baseUser
      const mergedUser = { ...baseUser, ...fullUser }
      setUser(mergedUser)
      localStorage.setItem("user", JSON.stringify(mergedUser))
      return mergedUser
    } catch {
      return baseUser
    }
  }

  useEffect(() => {
    ;(async () => {
      try {
        const savedUser = JSON.parse(localStorage.getItem("user"))
        const savedRole = localStorage.getItem("role")

        if (savedUser && savedRole) {
          setUser(savedUser)
          setRole(savedRole)

          // ✅ on refresh also hydrate (for profileImage etc.)
          await hydrateUserProfile(savedUser)
        }
      } catch (err) {
        localStorage.removeItem("user")
        localStorage.removeItem("role")
        setUser(null)
        setRole(null)
      }
    })()
  }, [])

  // ✅ login now hydrates immediately (no refresh needed)
  const login = async (userData, userRole) => {
    setUser(userData)
    setRole(userRole)

    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("role", userRole)

    // add role into saved user too (helps your ProtectedRoute fallback)
    try {
      const withRole = { ...userData, role: userRole }
      setUser(withRole)
      localStorage.setItem("user", JSON.stringify(withRole))
      await hydrateUserProfile(withRole)
    } catch {
      // ignore
    }
  }

  const logout = () => {
    setUser(null)
    setRole(null)
    localStorage.removeItem("user")
    localStorage.removeItem("role")
  }

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}