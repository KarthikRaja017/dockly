import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/server/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function userRegister(params: any) {
  return api.post("/user/sign-up", params);
}

export async function emailVerification(params: any) {
  return api.post("/user/email/otpVerification", params);
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
  return api.get("/get/currentUser", {
    params: { params },
  });
}
