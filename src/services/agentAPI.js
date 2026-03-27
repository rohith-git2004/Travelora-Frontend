import commonAPI from "./commonAPI"
import serverURL from "./serverURL"

// Agent create package
export const createPackageAPI = async (packageData, token) => {
  return await commonAPI(
    "POST",
    `${serverURL}/api/packages`,
    packageData,
    {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    }
  )
}

// Agent get own packages
export const getAgentPackagesAPI = async (token) => {
  return await commonAPI(
    "GET",
    `${serverURL}/api/packages/agent`,
    "",
    {
      Authorization: `Bearer ${token}`,
    }
  )
}

// Agent get bookings of own packages
export const getAgentBookingsAPI = async (token) => {
  return await commonAPI(
    "GET",
    `${serverURL}/api/bookings/agent`,
    "",
    {
      Authorization: `Bearer ${token}`,
    }
  )
}

// Agent update own package
export const updateAgentPackageAPI = async (id, packageData, token) => {
  return await commonAPI(
    "PUT",
    `${serverURL}/api/packages/agent/${id}`,
    packageData,
    {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    }
  )
}

// Agent delete own package
export const deleteAgentPackageAPI = async (id, token) => {
  return await commonAPI(
    "DELETE",
    `${serverURL}/api/packages/agent/${id}`,
    {},
    {
      Authorization: `Bearer ${token}`,
    }
  )
}