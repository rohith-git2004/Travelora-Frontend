import commonAPI from "./commonAPI"
import serverURL from "./serverURL"

// Admin get all packages
export const getAllPackagesAdminAPI = async (token) => {
  return await commonAPI(
    "GET",
    `${serverURL}/api/packages/admin`,
    "",
    {
      Authorization: `Bearer ${token}`
    }
  )
}

// Admin approve / reject package
export const updatePackageStatusAPI = async (id, status, token) => {
  return await commonAPI(
    "PUT",
    `${serverURL}/api/packages/${id}/status`,
    { status },
    {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  )
}


