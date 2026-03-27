import commonAPI from "./commonAPI"
import serverURL from "./serverURL"
import axios from "axios"

export const createBookingAPI = async (reqBody, token) => {
  return await commonAPI("POST", `${serverURL}/api/bookings`, reqBody, {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  })
}

export const getMyBookingsAPI = async (token) => {
  return await commonAPI("GET", `${serverURL}/api/bookings/my`, null, {
    Authorization: `Bearer ${token}`,
  })
}

export const cancelBookingAPI = async (bookingId, token) => {
  return await commonAPI(
    "PUT",
    `${serverURL}/api/bookings/${bookingId}/cancel`,
    null,
    { Authorization: `Bearer ${token}` }
  )
}

// ✅ FIXED: your commonAPI is a wrapper function (not axios instance)
export const dummyPayAPI = async (bookingId, token) => {
  return await commonAPI(
    "PUT",
    `${serverURL}/api/bookings/${bookingId}/pay-dummy`,
    null,
    { Authorization: `Bearer ${token}` }
  )
}

// ✅ IMPORTANT: receipt should be downloaded as blob (best done with axios)
export const downloadReceiptAPI = async (bookingId, token) => {
  return await axios.get(`${serverURL}/api/bookings/${bookingId}/receipt`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  })
}

export const getAllBookingsAdminAPI = async (token) => {
  return await commonAPI("GET", `${serverURL}/api/bookings`, "", {
    Authorization: `Bearer ${token}`,
  })
}

export const getAgentBookingsAPI = async (token) => {
  return await commonAPI("GET", `${serverURL}/api/bookings/agent`, null, {
    Authorization: `Bearer ${token}`,
  })
}