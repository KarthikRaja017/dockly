from .models import (
    AddGoogleCalendar,
    AddGoogleCalendarEvent,
    AddNotes,
    DeleteNotes,
    GetGoogleCalendarEvents,
    GetNotes,
    GoogleCallback,
    UpdateNotes,
)
from . import google_api


google_api.add_resource(AddGoogleCalendar, "/add-googleCalendar")
google_api.add_resource(GoogleCallback, "/auth/callback/google")
google_api.add_resource(GetGoogleCalendarEvents, "/get/calendar/events")
google_api.add_resource(AddGoogleCalendarEvent, "/add/calendar/events")
google_api.add_resource(AddNotes, "/add/notes")
google_api.add_resource(GetNotes, "/get/notes")
google_api.add_resource(DeleteNotes, "/delete/notes")
google_api.add_resource(UpdateNotes, "/update/notes")
