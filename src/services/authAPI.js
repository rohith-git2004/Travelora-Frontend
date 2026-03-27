import commonAPI from "./commonAPI"
import serverURL from "./serverURL"

// Register user
export const registerUserAPI = async (reqBody) => {
  return await commonAPI("POST", `${serverURL}/api/users/register`, reqBody, {
    "Content-Type": "application/json",
  })
}

// Login user
export const loginAPI = async (userDetails) => {
  return await commonAPI("POST", `${serverURL}/api/users/login`, userDetails, {
    "Content-Type": "application/json",
  })
}

export const googleLoginAPI = async (token) => {
  return await commonAPI(
    "POST",
    `${serverURL}/api/users/google-login`,
    { credential: token },
    { "Content-Type": "application/json" }
  )
}