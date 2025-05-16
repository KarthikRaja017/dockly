import { api } from "./apiConfig";

export default async function addUsername(params: any) {
  return api.post("/user/add/username", params);
}

export async function userAddEmail(params: any) {
  return api.post("/user/sign-up/email", params);
}