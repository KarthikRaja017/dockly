import { api } from "./apiConfig";

export default async function addGoogle(params: any) {
  return api.post("/add-googleAccount", params);
}