import { useEffect, useMemo, useRef, useState } from "react"
import {
  getUserProfileAPI,
  updateUserProfileAPI,
} from "../../services/userAPI"
import serverURL from "../../services/serverURL"

function AdminProfile() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [profile, setProfile] = useState(null)
  const [preview, setPreview] = useState("")
  const [image, setImage] = useState(null)

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  const fileInputRef = useRef(null)

  const token = useMemo(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"))
    return storedUser?.token || null
  }, [])

  const profileImage = profile?.profileImage || ""
  const currentImageSrc = profileImage
    ? `${serverURL}/uploads/${profileImage}`
    : ""

  const initials = useMemo(() => {
    const name = formData.name?.trim() || profile?.name?.trim() || "Admin"
    const parts = name.split(" ").filter(Boolean)
    const first = parts[0]?.[0] || "A"
    const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
    return (first + last).toUpperCase()
  }, [formData.name, profile?.name])

  const glassCard =
    "rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-sm shadow-black/10"

  const inputClass =
    "w-full bg-white/50 backdrop-blur-md border border-white/50 rounded-2xl px-4 py-3 outline-none shadow-sm placeholder:text-gray-500 text-gray-800"

  const disabledInputClass =
    "w-full bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 outline-none text-gray-500 cursor-not-allowed"

  const primaryButton =
    "px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 text-white font-semibold shadow-sm hover:brightness-110 transition disabled:opacity-70 disabled:cursor-not-allowed"

  const secondaryButton =
    "px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold shadow-sm hover:bg-gray-50 transition"

  const fetchProfile = async () => {
    try {
      if (!token) {
        setLoading(false)
        return
      }

      const reqHeader = {
        Authorization: `Bearer ${token}`,
      }

      const res = await getUserProfileAPI(reqHeader)

      if (res?.status === 200) {
        const data = res.data
        setProfile(data)
        setFormData({
          name: data?.name || "",
          email: data?.email || "",
          phone: data?.phone || "",
          address: data?.address || "",
        })
      }
    } catch (err) {
      console.log("PROFILE FETCH ERROR:", err)
      alert("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const openFilePicker = () => {
    if (!isEditing) return
    fileInputRef.current?.click()
  }

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
    })
    setImage(null)
    setPreview("")
  }

  const handleSubmit = async () => {
    try {
      setSaving(true)

      const reqBody = new FormData()
      reqBody.append("name", formData.name)
      reqBody.append("email", formData.email)
      reqBody.append("phone", formData.phone)
      reqBody.append("address", formData.address)

      if (image) {
        reqBody.append("profileImage", image)
      }

      const reqHeader = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      }

      const res = await updateUserProfileAPI(reqBody, reqHeader)

      if (res?.status === 200) {
        const updated = res.data

        setProfile(updated)
        setFormData({
          name: updated?.name || "",
          email: updated?.email || "",
          phone: updated?.phone || "",
          address: updated?.address || "",
        })
        setPreview("")
        setImage(null)
        setIsEditing(false)

        const storedUser = JSON.parse(localStorage.getItem("user")) || {}
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...storedUser,
            ...updated,
            token: storedUser.token,
          })
        )

        setSuccessMessage("Profile updated successfully")
        setShowSuccessModal(true)
      } else {
        alert("Failed to update profile")
      }
    } catch (err) {
      console.log("PROFILE UPDATE ERROR:", err)
      alert(err?.response?.data?.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleEditClick = () => {
    setIsEditing(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-sky-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className={`${glassCard} p-6 text-center text-gray-700`}>
            Loading profile...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-sky-50">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Admin{" "}
            <span className="bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500 bg-clip-text text-transparent">
              Profile
            </span>
          </h1>

          <p className="mt-2 text-gray-600 max-w-2xl">
            View and update your account details.
          </p>
        </div>

        <div className={`p-6 sm:p-8 ${glassCard}`}>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-80">
              <div className="rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-6 shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImage}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={openFilePicker}
                    className={`relative ${isEditing ? "cursor-pointer" : "cursor-default"}`}
                  >
                    {preview || currentImageSrc ? (
                      <img
                        src={preview || currentImageSrc}
                        alt="Profile"
                        className="w-28 h-28 rounded-full object-cover border-4 border-white shadow"
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-full bg-gradient-to-r from-blue-500 to-sky-500 text-white flex items-center justify-center text-3xl font-bold shadow">
                        {initials}
                      </div>
                    )}

                    {isEditing && (
                      <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-blue-600">
                        ✎
                      </div>
                    )}
                  </button>

                  <h2 className="mt-4 text-xl font-bold text-gray-900">
                    {formData.name || "Admin"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500 break-all">
                    {formData.email || "-"}
                  </p>

                  <span className="mt-3 px-4 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 capitalize">
                    {profile?.role || "admin"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-6 shadow-sm relative">
                <div className="absolute top-6 right-6 flex items-center gap-3">
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={handleEditClick}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                    >
                      ✎
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving}
                        className={primaryButton}
                      >
                        {saving ? "Updating..." : "Update"}
                      </button>

                      <button
                        type="button"
                        onClick={handleCancel}
                        className={secondaryButton}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Admin Details
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter name"
                      disabled={!isEditing}
                      className={isEditing ? inputClass : disabledInputClass}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                      disabled={!isEditing}
                      className={isEditing ? inputClass : disabledInputClass}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      disabled={!isEditing}
                      className={isEditing ? inputClass : disabledInputClass}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <input
                      type="text"
                      value={profile?.role || "admin"}
                      disabled
                      className={disabledInputClass}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter address"
                    rows="4"
                    disabled={!isEditing}
                    className={`resize-none ${
                      isEditing ? inputClass : disabledInputClass
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white backdrop-blur-xl shadow-2xl p-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 border border-green-200 flex items-center justify-center text-2xl mb-4">
              ✓
            </div>

            <h3 className="text-2xl font-bold text-gray-900">
              Profile Updated
            </h3>

            <p className="mt-2 text-gray-600">{successMessage}</p>

            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 hover:brightness-110 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProfile