import { api } from "./apiConfig";

export async function addGoogleCalendar(params: any) {
  return api.get("/add-googleCalendar", {
    params,
  });
}

export async function getGoogleCalendarEvents(params: any) {
  return api.get("/get/calendar/events", {
    params,
  });
}
