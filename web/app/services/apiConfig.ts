import axios from "axios";

// const api = axios.create({
//   baseURL: "https://dockly.onrender.com/server/api",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });
const api = axios.create({
  baseURL: "http://192.168.1.11:5000/server/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("Dtoken"); 

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export async function userRegister(params: any) {
  return api.post("/user/sign-up", params);
}

export async function userAddMobile(params: any) {
  return api.post("/user/sign-up/mobile", params);
}

export async function emailVerification(params: any) {
  return api.post("/user/email/otpVerification", params);
}
export async function mobileVerification(params: any) {
  return api.post("/user/mobile/otpVerification", params);
}

export async function signInVerification(params: any) {
  return api.post("/user/signIn/otpVerification", params);
}

export async function userDetails(params: any) {
  return api.post("/user/add-details", params);
}

export async function userLogin(params: any) {
  return api.post("/user/sign-in", params);
}

export async function getSmartBookmarks(uid: string) {
  return api.get("/bookmarks/get", {
    params: { uid },
  });
}

export async function getCurrentUser(params: string) {
  return api.get("/user/get/currentUser", {
    params: { params },
  });
}
