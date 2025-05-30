from .models import AddGoogleCalendar, GoogleCallback
from . import google_api


google_api.add_resource(AddGoogleCalendar, "/add-googleCalendar")
google_api.add_resource(GoogleCallback, "/auth/callback/google")
