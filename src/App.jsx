import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Header from "./components/Header"
import Footer from "./components/Footer"
import ScrollToTop from "./components/ScrollToTop"
import ProtectedRoute from "./components/ProtectedRoute"
import PublicRoute from "./components/PublicRoute"

import Landing from "./pages/Landing"
import Login from "./pages/Login"
import Register from "./pages/Register"

import Packages from "./user/pages/Packages"
import MyBookings from "./user/pages/MyBookings"
import BookingHistory from "./user/pages/BookingHistory"
import Profile from "./user/pages/Profile"
import WhishList from "./user/pages/WhishList"
import PackageDetails from "./user/pages/PackageDetails"
import UserDashboard from "./user/pages/Dashboard"

import AgentDashboard from "./agent/pages/Dashboard"
import MyPackages from "./agent/pages/MyPackages"
import CreatePackage from "./agent/pages/CreatePackage"
import AgentHistory from "./agent/pages/AgentHistory"
import UpdatePackage from "./agent/pages/UpdatePackage"
import AgentProfile from "./agent/pages/AgentProfile"

import AdminDashboard from "./admin/pages/Dashboard"
import Users from "./admin/pages/Users"
import AdminPackages from "./admin/pages/Packages"
import Bookings from "./admin/pages/AdminBookingHistory"
import AdminProfile from "./admin/pages/AdminProfile"
import CreateAgent from "./admin/pages/CreateAgent"



function AppLayout() {
  return (
    <>
      <Header />

      <div className="flex">
        <div className="flex-1">
          <Routes>

            {/* PUBLIC */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Landing />
                </PublicRoute>
              }
            />

            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* USER */}
            <Route
              path="/user/dashboard"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/user/packages"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <Packages />
                </ProtectedRoute>
              }
            />

            <Route
              path="/user/packages/:id"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <PackageDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/user/bookings"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <MyBookings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/user/history"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <BookingHistory />
                </ProtectedRoute>
              }
            />

            <Route
              path="/user/profile"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/user/saved"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <WhishList />
                </ProtectedRoute>
              }
            />

            {/* AGENT */}
            <Route
              path="/agent/dashboard"
              element={
                <ProtectedRoute allowedRoles={["agent"]}>
                  <AgentDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/agent/profile"
              element={
                <ProtectedRoute allowedRoles={["agent"]}>
                  <AgentProfile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/agent/update/:id"
              element={
                <ProtectedRoute allowedRoles={["agent"]}>
                  <UpdatePackage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/agent/packages"
              element={
                <ProtectedRoute allowedRoles={["agent"]}>
                  <MyPackages />
                </ProtectedRoute>
              }
            />

            <Route
              path="/agent/create"
              element={
                <ProtectedRoute allowedRoles={["agent"]}>
                  <CreatePackage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/agent/history"
              element={
                <ProtectedRoute allowedRoles={["agent"]}>
                  <AgentHistory />
                </ProtectedRoute>
              }
            />

            {/* ADMIN */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Users />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/packages"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminPackages />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Bookings />
                </ProtectedRoute>
              }
            />

            {/* ✅ FIXED ROUTE */}
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminProfile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/create-agent"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <CreateAgent />
                </ProtectedRoute>
              }
            />

          </Routes>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <ScrollToTop />
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  )
}