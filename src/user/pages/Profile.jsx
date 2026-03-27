import { useEffect, useMemo, useState, useContext } from "react"
import { getUserProfileAPI, updateUserProfileAPI } from "../../services/userAPI"
import serverURL from "../../services/serverURL"
import { AuthContext } from "../../context/AuthContext"
import { Camera, Edit3, X, ShieldCheck, MapPin, User2 } from "lucide-react"

function Profile() {
  const { user } = useContext(AuthContext)

  const [profile, setProfile] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState("")

  // ✅ Page-enter animation only
  const [pageEnter, setPageEnter] = useState(false)

  // ====== THEME (your Packages/Dashboard light theme) ======
  const glassCard =
    "relative overflow-hidden rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-sm shadow-black/10"

  const glassHover =
    "transition-all duration-300 hover:bg-white/75 hover:border-white/80 hover:ring-1 hover:ring-sky-200 hover:shadow-md hover:-translate-y-[2px]"

  const inputClass =
    "w-full bg-white/30 backdrop-blur-md border border-white/40 rounded-2xl px-4 py-3 outline-none shadow-sm placeholder:text-gray-500 text-gray-800 focus:bg-white/40 transition"

  const selectClass =
    "w-full bg-white/30 backdrop-blur-md border border-white/40 rounded-2xl px-4 py-3 outline-none shadow-sm text-gray-800 focus:bg-white/40 transition"

  const token = useMemo(() => {
    if (user?.token) return user.token
    const ls = localStorage.getItem("user")
    return ls ? JSON.parse(ls)?.token : null
  }, [user?.token])

  // ================= LOAD PROFILE =================
  useEffect(() => {
    setPageEnter(true)

    const fetchProfile = async () => {
      if (!token) return
      try {
        const reqHeader = { Authorization: `Bearer ${token}` }
        const result = await getUserProfileAPI(reqHeader)
        const userData = result.data.user || result.data

        setProfile({
          ...userData,

          hasPassport:
            userData?.hasPassport === true
              ? "yes"
              : userData?.hasPassport === false
              ? "no"
              : userData?.hasPassport || "",
          hasDrivingLicense:
            userData?.hasDrivingLicense === true
              ? "yes"
              : userData?.hasDrivingLicense === false
              ? "no"
              : userData?.hasDrivingLicense || "",

          nationality: userData?.nationality || "",
          state: userData?.state || "",
          emergencyContact: userData?.emergencyContact || "",
        })
      } catch (error) {
        console.log(error)
      }
    }

    fetchProfile()
  }, [token])

  // ================= SAVE PROFILE =================
  const handleSave = async () => {
    if (!token) return

    try {
      const formData = new FormData()

      formData.append("name", profile.name || "")
      formData.append("phone", profile.phone || "")
      formData.append("age", profile.age || "")
      formData.append("gender", profile.gender || "")
      formData.append("bloodGroup", profile.bloodGroup || "")
      formData.append("address", profile.address || "")
      formData.append("nationality", profile.nationality || "")
      formData.append("state", profile.state || "")
      formData.append("emergencyContact", profile.emergencyContact || "")
      formData.append("hasPassport", profile.hasPassport || "")
      formData.append("hasDrivingLicense", profile.hasDrivingLicense || "")

      if (imageFile) formData.append("profileImage", imageFile)

      const reqHeader = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      }

      setLoading(true)

      const result = await updateUserProfileAPI(formData, reqHeader)
      const updatedUser = result.data.user || result.data

      setProfile({
        ...updatedUser,

        hasPassport:
          updatedUser?.hasPassport === true
            ? "yes"
            : updatedUser?.hasPassport === false
            ? "no"
            : updatedUser?.hasPassport || profile.hasPassport || "",
        hasDrivingLicense:
          updatedUser?.hasDrivingLicense === true
            ? "yes"
            : updatedUser?.hasDrivingLicense === false
            ? "no"
            : updatedUser?.hasDrivingLicense || profile.hasDrivingLicense || "",

        nationality: updatedUser?.nationality ?? profile.nationality ?? "",
        state: updatedUser?.state ?? profile.state ?? "",
        emergencyContact:
          updatedUser?.emergencyContact ?? profile.emergencyContact ?? "",
      })

      setIsEditing(false)
      setPreview("")
      setImageFile(null)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const profileSrc = useMemo(() => {
    const img = profile?.profileImage || ""
    return img ? `${serverURL}/uploads/${img}` : ""
  }, [profile?.profileImage])

  const initials = useMemo(() => {
    const name = profile?.name?.trim() || user?.name?.trim() || "Traveler"
    const parts = name.split(" ").filter(Boolean)
    const first = parts[0]?.[0] || "T"
    const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
    return (first + last).toUpperCase()
  }, [profile?.name, user?.name])

  const cancelEdit = () => {
    setIsEditing(false)
    setPreview("")
    setImageFile(null)
  }

  // ✅ Verified when all key fields are filled
  const isVerified = useMemo(() => {
    const hasPhoto = Boolean(preview || profileSrc)
    const ok = (v) => String(v || "").trim().length > 0
    const yesNoOk = (v) => v === "yes" || v === "no"

    return (
      hasPhoto &&
      ok(profile?.name) &&
      ok(profile?.phone) &&
      ok(profile?.age) &&
      ok(profile?.gender) &&
      ok(profile?.bloodGroup) &&
      ok(profile?.nationality) &&
      ok(profile?.state) &&
      ok(profile?.address) &&
      ok(profile?.emergencyContact) &&
      yesNoOk(profile?.hasPassport) &&
      yesNoOk(profile?.hasDrivingLicense)
    )
  }, [
    preview,
    profileSrc,
    profile?.name,
    profile?.phone,
    profile?.age,
    profile?.gender,
    profile?.bloodGroup,
    profile?.nationality,
    profile?.state,
    profile?.address,
    profile?.emergencyContact,
    profile?.hasPassport,
    profile?.hasDrivingLicense,
  ])

  const docDot = (v) => {
    const val = String(v || "").toLowerCase()
    const yes = val === "yes" || val === "true"
    const no = val === "no" || val === "false"
    return yes ? "bg-emerald-500" : no ? "bg-rose-500" : "bg-gray-400"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-sky-50">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className={`${pageEnter ? "page-enter" : ""}`}>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
              Traveller Profile{" "}
              <span className="bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                • Travelora
              </span>
            </h1>
            <p className="mt-2 text-gray-500 max-w-2xl">
              View your traveller info and update details anytime.
            </p>
          </div>

          {/* ✅ SINGLE CONTAINER */}
          <div className="max-w-3xl mx-auto">
            <div className={`p-8 ${glassCard} ${glassHover}`}>
              {/* Avatar + Name */}
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full overflow-hidden border border-white/70 bg-white/60 flex items-center justify-center">
                    {preview ? (
                      <img
                        src={preview}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : profileSrc ? (
                      <img
                        src={profileSrc}
                        alt="profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold">
                        {initials}
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <label className="absolute -bottom-2 -right-2 bg-white/70 border border-white/60 backdrop-blur p-2 rounded-xl shadow cursor-pointer hover:bg-white/80 transition">
                      <Camera size={16} className="text-gray-800" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) {
                            setImageFile(f)
                            setPreview(URL.createObjectURL(f))
                          }
                        }}
                      />
                    </label>
                  )}
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile?.name || user?.name || "Traveler"}
                  </h2>

                  {isVerified && (
                    <span
                      title="Verified traveller"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full"
                    >
                      <ShieldCheck size={14} />
                      Verified
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 w-full max-w-md flex gap-3">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white font-semibold hover:brightness-110 transition hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <Edit3 size={16} /> Edit Profile
                    </button>
                  ) : (
                    <button
                      onClick={cancelEdit}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-sky-500 text-white font-semibold hover:brightness-110 transition hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <X size={16} /> Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* ✅ INITIAL VIEW CONTENTS */}
              {!isEditing && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* LEFT */}
                  <div className="rounded-2xl bg-white/40 border border-white/50 backdrop-blur p-5">
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-gray-900" />
                      <h3 className="font-semibold text-gray-900">
                        Travel Identity
                      </h3>
                    </div>

                    <div className="mt-4 space-y-3 text-sm">
                      <Row label="Nationality" value={profile?.nationality} />
                      <Row label="State" value={profile?.state} />

                      {/* ✅ Address single-line (no big empty space) */}
                      <Row
                        label="Address"
                        value={profile?.address}
                        singleLine
                      />

                      <div className="pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Passport</span>
                          <span className="inline-flex items-center gap-2 font-semibold text-gray-900">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${docDot(
                                profile?.hasPassport
                              )}`}
                            />
                            {profile?.hasPassport
                              ? profile.hasPassport.toUpperCase()
                              : "—"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-gray-600">Driving License</span>
                          <span className="inline-flex items-center gap-2 font-semibold text-gray-900">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${docDot(
                                profile?.hasDrivingLicense
                              )}`}
                            />
                            {profile?.hasDrivingLicense
                              ? profile.hasDrivingLicense.toUpperCase()
                              : "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="rounded-2xl bg-white/40 border border-white/50 backdrop-blur p-5">
                    <div className="flex items-center gap-2">
                      <User2 size={18} className="text-gray-900" />
                      <h3 className="font-semibold text-gray-900">
                        Personal Details
                      </h3>
                    </div>

                    <div className="mt-4 space-y-3 text-sm">
                      <Row
                        label="Name"
                        value={profile?.name || user?.name || ""}
                      />
                      <Row label="Age" value={profile?.age} />
                      <Row label="Gender" value={profile?.gender} />
                      <Row label="Blood Group" value={profile?.bloodGroup} />
                      <Row
                        label="Emergency Contact"
                        value={profile?.emergencyContact}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ Edit form */}
              {isEditing && (
                <>
                  <div className="mt-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-gray-600">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profile?.name || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, name: e.target.value })
                          }
                          placeholder="Full Name"
                          className={`${inputClass} mt-2`}
                        />
                      </div>

                      {/* Email locked */}
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-gray-600">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profile?.email || user?.email || ""}
                          disabled
                          className={`${inputClass} mt-2 opacity-80 cursor-not-allowed`}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600">
                          Mobile
                        </label>
                        <input
                          type="tel"
                          value={profile?.phone || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, phone: e.target.value })
                          }
                          placeholder="Mobile Number"
                          className={`${inputClass} mt-2`}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600">
                          Emergency Contact Number
                        </label>
                        <input
                          type="tel"
                          value={profile?.emergencyContact || ""}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              emergencyContact: e.target.value,
                            })
                          }
                          placeholder="Emergency contact number"
                          className={`${inputClass} mt-2`}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600">
                          Age
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={profile?.age || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, age: e.target.value })
                          }
                          placeholder="Age"
                          className={`${inputClass} mt-2`}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600">
                          Gender
                        </label>
                        <select
                          value={profile?.gender || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, gender: e.target.value })
                          }
                          className={`${selectClass} mt-2`}
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600">
                          Blood Group
                        </label>
                        <input
                          type="text"
                          value={profile?.bloodGroup || ""}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              bloodGroup: e.target.value,
                            })
                          }
                          placeholder="Blood Group (e.g., O+)"
                          className={`${inputClass} mt-2`}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600">
                          Nationality
                        </label>
                        <input
                          type="text"
                          value={profile?.nationality || ""}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              nationality: e.target.value,
                            })
                          }
                          placeholder="Nationality (e.g., Indian)"
                          className={`${inputClass} mt-2`}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600">
                          State
                        </label>
                        <input
                          type="text"
                          value={profile?.state || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, state: e.target.value })
                          }
                          placeholder="State (e.g., Kerala)"
                          className={`${inputClass} mt-2`}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600">
                          Passport available?
                        </label>
                        <div className="mt-2">
                          <YesNoDots
                            value={profile?.hasPassport || ""}
                            onChange={(v) =>
                              setProfile({ ...profile, hasPassport: v })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600">
                          Driving license available?
                        </label>
                        <div className="mt-2">
                          <YesNoDots
                            value={profile?.hasDrivingLicense || ""}
                            onChange={(v) =>
                              setProfile({ ...profile, hasDrivingLicense: v })
                            }
                          />
                        </div>
                      </div>

                      {/* ✅ Address stays single-line input */}
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-gray-600">
                          Address (single line)
                        </label>
                        <input
                          type="text"
                          value={profile?.address || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, address: e.target.value })
                          }
                          placeholder="House, Street, City"
                          className={`${inputClass} mt-2`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ✅ SAVE BUTTON AT BOTTOM */}
                  <div className="mt-8 pt-6 border-t border-white/50">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className={`w-full py-3 rounded-2xl text-white font-semibold bg-gradient-to-r from-emerald-500 to-green-500 transition hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] ${
                        loading ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <style>{`
          .page-enter { animation: pageEnter 0.45s ease-out both; }
          @keyframes pageEnter {
            from { opacity: 0; transform: translateY(14px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </section>
    </div>
  )
}

function YesNoDots({ value, onChange }) {
  const base =
    "w-full rounded-2xl bg-white/30 border border-white/40 backdrop-blur-md shadow-sm px-4 py-3 flex items-center justify-between"
  const optionBase = "flex items-center gap-2 text-sm font-semibold select-none"
  const dotBase = "w-3 h-3 rounded-full border"

  const isYes = value === "yes"
  const isNo = value === "no"

  return (
    <div className={base}>
      <button type="button" onClick={() => onChange("yes")} className={optionBase}>
        <span
          className={`${dotBase} ${
            isYes ? "bg-emerald-500 border-emerald-600" : "bg-white border-gray-400"
          }`}
        />
        <span className="text-gray-800">Yes</span>
      </button>

      <div className="h-6 w-px bg-white/60" />

      <button type="button" onClick={() => onChange("no")} className={optionBase}>
        <span
          className={`${dotBase} ${
            isNo ? "bg-rose-500 border-rose-600" : "bg-white border-gray-400"
          }`}
        />
        <span className="text-gray-800">No</span>
      </button>
    </div>
  )
}

function Row({ label, value, singleLine = false }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-600">{label}</span>
      <span
        className={`font-semibold text-gray-900 text-right ${
          singleLine ? "truncate max-w-[55%]" : ""
        }`}
        title={singleLine ? String(value || "") : undefined}
      >
        {String(value || "").trim() ? value : "—"}
      </span>
    </div>
  )
}

export default Profile