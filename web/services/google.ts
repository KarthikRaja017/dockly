import { api } from "./apiConfig";

export default async function addGoogleCalendar(params: any) {
  return api.get("/add-googleCalendar", {
    params,
  });
}
