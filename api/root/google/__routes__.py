<<<<<<< HEAD
# from .models import AddGoogleCalendar, GetGoogleCalendarEvents, GoogleCallback
# from . import google_api


# google_api.add_resource(AddGoogleCalendar, "/add-googleCalendar")
# google_api.add_resource(GoogleCallback, "/auth/callback/google")
# google_api.add_resource(GetGoogleCalendarEvents, "/get/calendar/events")
=======
from .models import AddGoogleCalendar, GetGoogleCalendarEvents, GoogleCallback
from . import google_api


google_api.add_resource(AddGoogleCalendar, "/add-googleCalendar")
google_api.add_resource(GoogleCallback, "/auth/callback/google")
google_api.add_resource(GetGoogleCalendarEvents, "/get/calendar/events")
>>>>>>> deb0ba0 (modified dockly and added new db)
