import commonAPI from "./commonAPI"
import serverURL from "./serverURL"

// ================= USER =================

// get all approved packages
export const getAllPackagesAPI = async () => {
  return await commonAPI("GET", `${serverURL}/api/packages`, "")
}

// get single package details
export const getPackageDetailsAPI = async (id) => {
  return await commonAPI("GET", `${serverURL}/api/packages/${id}`, "")
}

// book a package
export const bookPackageAPI = async (reqBody, token) => {
  return await commonAPI(
    "POST",
    `${serverURL}/api/bookings`,
    reqBody,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  )
}

// ================= PROFILE =================

export const getUserProfileAPI = async (reqHeader) => {
  return await commonAPI("GET", `${serverURL}/api/users/profile`, "", reqHeader)
}

export const updateUserProfileAPI = async (formData, reqHeader) => {
  return await commonAPI(
    "PUT",
    `${serverURL}/api/users/profile`,
    formData,
    reqHeader
  )
}

// ================= ADMIN =================

// get all users & agents
export const getAllUsersAdminAPI = async (token) => {
  return await commonAPI(
    "GET",
    `${serverURL}/api/users/admin/users`,
    "",
    {
      Authorization: `Bearer ${token}`,
    }
  )
}

// delete user / agent
export const deleteUserAdminAPI = async (id, token) => {
  return await commonAPI(
    "DELETE",
    `${serverURL}/api/users/admin/users/${id}`,
    "",
    {
      Authorization: `Bearer ${token}`,
    }
  )
}

// create agent
export const createAgentAPI = async (reqBody, token) => {
  return await commonAPI(
    "POST",
    `${serverURL}/api/users/register-agent`,
    reqBody,
    {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  )
}

// create admin
export const createAdminAPI = async (reqBody, token) => {
  return await commonAPI(
    "POST",
    `${serverURL}/api/users/register-admin`,
    reqBody,
    {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  )
}